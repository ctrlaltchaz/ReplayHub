import { Injectable, NotFoundException } from '@nestjs/common';
import { chromium } from 'playwright';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class ExportService {
    constructor(private prisma: PrismaService) { }

    async generateRosterSheet(tenantId: string, teamId: string): Promise<Buffer> {
        // Fetch team with full roster data
        const team = await this.prisma.team.findFirst({
            where: { id: teamId, tenantId },
            include: {
                coach: {
                    select: { displayName: true, email: true },
                },
                members: {
                    include: {
                        player: {
                            select: {
                                gamerTag: true,
                                role: true,
                                rank: true,
                                eligibility: true,
                                mainsJson: true,
                                orgUser: {
                                    select: { displayName: true, email: true },
                                },
                            },
                        },
                    },
                    orderBy: [{ isStarter: 'desc' }, { position: 'asc' }],
                },
            },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        // Get tenant info for branding
        const tenant = await this.prisma.organisation.findFirst({
            where: { id: tenantId },
            select: { name: true, slug: true },
        });

        const htmlContent = this.generateRosterSheetHTML(team, tenant);
        return this.generatePDF(htmlContent, `${team.name}-roster-sheet`);
    }

    async generateCallSheet(tenantId: string, eventId: string): Promise<Buffer> {
        // Fetch lineup with event details
        const lineup = await this.prisma.lineup.findFirst({
            where: { eventId, tenantId },
            include: {
                team: {
                    select: { name: true, game: true, season: true },
                },
                slots: {
                    include: {
                        player: {
                            select: {
                                gamerTag: true,
                                role: true,
                                rank: true,
                                mainsJson: true,
                                orgUser: {
                                    select: { displayName: true, email: true },
                                },
                            },
                        },
                    },
                    orderBy: [{ isSub: 'asc' }, { idx: 'asc' }],
                },
            },
        });

        if (!lineup) {
            throw new NotFoundException('Lineup not found for this event');
        }

        // Get tenant info for branding
        const tenant = await this.prisma.organisation.findFirst({
            where: { id: tenantId },
            select: { name: true, slug: true },
        });

        const htmlContent = this.generateCallSheetHTML(lineup, tenant, eventId);
        return this.generatePDF(htmlContent, `${lineup.team.name}-call-sheet-${eventId}`);
    }

    private generateRosterSheetHTML(team: any, tenant: any): string {
        const starters = team.members.filter((m: any) => m.isStarter);
        const subs = team.members.filter((m: any) => !m.isStarter);

        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${team.name} - Roster Sheet</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .org-name {
            color: #6b7280;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 5px;
          }
          .team-name {
            font-size: 32px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .team-details {
            color: #6b7280;
            font-size: 16px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .roster-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .roster-table th,
          .roster-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          .roster-table th {
            background: #f9fafb;
            font-weight: bold;
            color: #374151;
          }
          .starter-row {
            background: #fef3c7;
          }
          .eligibility {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          .eligible { background: #d1fae5; color: #065f46; }
          .probation { background: #fef3c7; color: #92400e; }
          .ineligible { background: #fee2e2; color: #991b1b; }
          .coach-info {
            background: #f0f9ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="org-name">${tenant?.name || 'Organization'}</div>
            <div class="team-name">${team.name}</div>
            <div class="team-details">${team.game} ${team.season ? `• ${team.season}` : ''}</div>
          </div>

          ${team.coach ? `
          <div class="section">
            <div class="coach-info">
              <strong>Coach:</strong> ${team.coach.displayName} (${team.coach.email})
            </div>
          </div>
          ` : ''}

          ${starters.length > 0 ? `
          <div class="section">
            <div class="section-title">Starting Lineup</div>
            <table class="roster-table">
              <thead>
                <tr>
                  <th>Gamer Tag</th>
                  <th>Position</th>
                  <th>Role</th>
                  <th>Rank</th>
                  <th>Mains</th>
                  <th>Eligibility</th>
                  <th>Real Name</th>
                </tr>
              </thead>
              <tbody>
                ${starters.map((member: any) => `
                  <tr class="starter-row">
                    <td><strong>${member.player.gamerTag}</strong></td>
                    <td>${member.position || '-'}</td>
                    <td>${member.player.role || '-'}</td>
                    <td>${member.player.rank || '-'}</td>
                    <td>${(member.player.mainsJson as string[]).join(', ') || '-'}</td>
                    <td><span class="eligibility ${member.player.eligibility || 'eligible'}">${member.player.eligibility || 'eligible'}</span></td>
                    <td>${member.player.orgUser?.displayName || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${subs.length > 0 ? `
          <div class="section">
            <div class="section-title">Substitutes</div>
            <table class="roster-table">
              <thead>
                <tr>
                  <th>Gamer Tag</th>
                  <th>Position</th>
                  <th>Role</th>
                  <th>Rank</th>
                  <th>Mains</th>
                  <th>Eligibility</th>
                  <th>Real Name</th>
                </tr>
              </thead>
              <tbody>
                ${subs.map((member: any) => `
                  <tr>
                    <td><strong>${member.player.gamerTag}</strong></td>
                    <td>${member.position || '-'}</td>
                    <td>${member.player.role || '-'}</td>
                    <td>${member.player.rank || '-'}</td>
                    <td>${(member.player.mainsJson as string[]).join(', ') || '-'}</td>
                    <td><span class="eligibility ${member.player.eligibility || 'eligible'}">${member.player.eligibility || 'eligible'}</span></td>
                    <td>${member.player.orgUser?.displayName || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="footer">
            Generated on ${new Date().toLocaleDateString()} • ${tenant?.name || 'Organization'} Esports
          </div>
        </div>
      </body>
      </html>
    `;
    }

    private generateCallSheetHTML(lineup: any, tenant: any, eventId: string): string {
        const starters = lineup.slots.filter((s: any) => !s.isSub);
        const subs = lineup.slots.filter((s: any) => s.isSub);

        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${lineup.team.name} - Call Sheet</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #dc2626;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .org-name {
            color: #6b7280;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 5px;
          }
          .team-name {
            font-size: 32px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .event-details {
            color: #6b7280;
            font-size: 16px;
          }
          .urgent-banner {
            background: linear-gradient(45deg, #dc2626, #b91c1c);
            color: white;
            padding: 15px;
            text-align: center;
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 30px;
            border-radius: 8px;
          }
          .call-times {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin-bottom: 30px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .lineup-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .lineup-table th,
          .lineup-table td {
            padding: 15px 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          .lineup-table th {
            background: #1f2937;
            color: white;
            font-weight: bold;
          }
          .starter-row {
            background: #dcfce7;
            font-weight: bold;
          }
          .sub-row {
            background: #fef3c7;
          }
          .contact-info {
            background: #f0f9ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="org-name">${tenant?.name || 'Organization'}</div>
            <div class="team-name">${lineup.team.name}</div>
            <div class="event-details">${lineup.title || `Event ${eventId}`} • ${lineup.team.game}</div>
          </div>

          <div class="urgent-banner">
            🚨 MATCH CALL SHEET - ATTENDANCE REQUIRED 🚨
          </div>

          <div class="call-times">
            <h3>📅 Important Times (Please arrive 15 minutes early):</h3>
            <ul>
              <li><strong>Team Meeting:</strong> TBD</li>
              <li><strong>Warm-up:</strong> TBD</li>
              <li><strong>Match Time:</strong> TBD</li>
            </ul>
            <p><strong>Note:</strong> Check Discord for exact times and any updates!</p>
          </div>

          ${starters.length > 0 ? `
          <div class="section">
            <div class="section-title">🏆 Starting Lineup</div>
            <table class="lineup-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Gamer Tag</th>
                  <th>Role/Agent</th>
                  <th>Mains</th>
                  <th>Contact</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${starters.map((slot: any, index: number) => `
                  <tr class="starter-row">
                    <td>${slot.role || `P${index + 1}`}</td>
                    <td><strong>${slot.player.gamerTag}</strong></td>
                    <td>${slot.player.role || '-'}</td>
                    <td>${(slot.player.mainsJson as string[]).join(', ') || '-'}</td>
                    <td>${slot.player.orgUser?.email || '-'}</td>
                    <td>${slot.notes || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${subs.length > 0 ? `
          <div class="section">
            <div class="section-title">🔄 Substitutes</div>
            <table class="lineup-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Gamer Tag</th>
                  <th>Role/Agent</th>
                  <th>Mains</th>
                  <th>Contact</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${subs.map((slot: any) => `
                  <tr class="sub-row">
                    <td>SUB</td>
                    <td><strong>${slot.player.gamerTag}</strong></td>
                    <td>${slot.player.role || '-'}</td>
                    <td>${(slot.player.mainsJson as string[]).join(', ') || '-'}</td>
                    <td>${slot.player.orgUser?.email || '-'}</td>
                    <td>${slot.notes || 'Ready as substitute'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="section">
            <div class="contact-info">
              <h3>📱 Emergency Contact & Communication:</h3>
              <ul>
                <li><strong>Team Discord:</strong> Check #announcements channel</li>
                <li><strong>Coach Contact:</strong> Available on Discord</li>
                <li><strong>Manager Contact:</strong> Available on Discord</li>
              </ul>
            </div>
          </div>

          <div class="section">
            <h3>✅ Pre-Match Checklist:</h3>
            <ul>
              <li>□ Confirm attendance in Discord</li>
              <li>□ Equipment check (headset, mouse, keyboard)</li>
              <li>□ Internet connection stable</li>
              <li>□ Game client updated</li>
              <li>□ Join team voice channel 15 minutes early</li>
            </ul>
          </div>

          <div class="footer">
            Generated on ${new Date().toLocaleString()} • Event ID: ${eventId}<br>
            ${tenant?.name || 'Organization'} Esports • Official Call Sheet
          </div>
        </div>
      </body>
      </html>
    `;
    }

    private async generatePDF(htmlContent: string, filename: string): Promise<Buffer> {
        const browser = await chromium.launch();
        const page = await browser.newPage();

        await page.setContent(htmlContent);

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                bottom: '20px',
                left: '20px',
                right: '20px',
            },
        });

        await browser.close();
        return Buffer.from(pdfBuffer);
    }
}