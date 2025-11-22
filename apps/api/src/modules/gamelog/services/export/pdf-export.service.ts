import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as playwright from 'playwright';
import { PrismaService } from '../../../../database/prisma.service';
import { MatchReportExport, MatchResponse } from '../../dto/gamelog.dto';
import { PlayerStatService } from '../playerstat.service';

@Injectable()
export class PdfExportService {
  constructor(
    private prisma: PrismaService,
    private playerStatService: PlayerStatService
  ) {}

  async generateMatchReport(tenantId: string, matchId: string): Promise<MatchReportExport> {
    return await this.prisma.$transaction(async tx => {
      // Set tenant context for RLS
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

      await this.playerStatService.migrateLegacyStatsToRound(tx, tenantId, matchId);

      // Get match data with all related information
      const match = await tx.match.findFirst({
        where: { id: matchId, tenantId },
        include: {
          team: true,
          lineup: {
            include: {
              slots: {
                include: {
                  player: true,
                },
              },
            },
          },
          maps: {
            orderBy: { gameIdx: 'asc' },
            include: {
              playerStats: {
                include: {
                  player: true,
                },
              },
            },
          },
          playerStats: {
            include: {
              player: true,
              mapGame: true,
            },
          },
          createdByGlobalUser: true,
        },
      });

      if (!match) {
        throw new NotFoundException('Match not found');
      }

      // Ensure export directory exists
      const exportDir = path.join(process.cwd(), 'data', tenantId, 'exports');
      await fs.ensureDir(exportDir);

      const fileName = `match-report-${matchId}.pdf`;
      const filePath = path.join(exportDir, fileName);

      // Generate HTML content
      const htmlContent = this.generateMatchReportHtml(match);

      // Launch browser and generate PDF
      const browser = await playwright.chromium.launch({ headless: true });
      const page = await browser.newPage();

      await page.setContent(htmlContent, { waitUntil: 'networkidle' });

      // Generate PDF with custom styling
      await page.pdf({
        path: filePath,
        format: 'A4',
        margin: {
          top: '1in',
          right: '0.5in',
          bottom: '1in',
          left: '0.5in',
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `
        <div style="font-size: 10px; color: #666; width: 100%; text-align: center; padding: 10px;">
          Match Report - ${match.opponent} vs ${match.team.name}
        </div>
      `,
        footerTemplate: `
        <div style="font-size: 10px; color: #666; width: 100%; text-align: center; padding: 10px;">
          Generated on <span class="date"></span> - Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
      });

      await browser.close();

      // Get file size
      const stats = await fs.stat(filePath);

      return {
        match: this.formatMatchForExport(match),
        filePath: `/data/${tenantId}/exports/${fileName}`,
        fileSize: stats.size,
        exportedAt: new Date().toISOString(),
      };
    });
  }

  private generateMatchReportHtml(match: any): string {
    const matchDate = match.startedAt ? new Date(match.startedAt).toLocaleDateString() : 'TBD';
    const duration = this.calculateMatchDuration(match);
    const mvpPlayer = match.playerStats.find((stat: any) => stat.isMvp);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Match Report - ${match.opponent} vs ${match.team.name}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
          }
          
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 600;
          }
          
          .header .subtitle {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .match-info {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 25px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          
          .info-item {
            text-align: center;
          }
          
          .info-label {
            font-weight: 600;
            color: #666;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 18px;
            color: #333;
            font-weight: 500;
          }
          
          .result-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .win { background-color: #d4edda; color: #155724; }
          .loss { background-color: #f8d7da; color: #721c24; }
          .draw { background-color: #fff3cd; color: #856404; }
          
          .section {
            background: white;
            margin-bottom: 25px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          
          .section-header {
            background-color: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #dee2e6;
            font-size: 18px;
            font-weight: 600;
            color: #333;
          }
          
          .section-content {
            padding: 20px;
          }
          
          .maps-container {
            display: grid;
            gap: 15px;
          }
          
          .map-card {
            border: 1px solid #dee2e6;
            border-radius: 6px;
            overflow: hidden;
          }
          
          .map-header {
            background-color: #f8f9fa;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
          }
          
          .map-score {
            font-size: 18px;
            color: #333;
          }
          
          .stats-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          
          .stats-table th,
          .stats-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
          }
          
          .stats-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .stats-table tr:hover {
            background-color: #f8f9fa;
          }
          
          .mvp {
            background-color: #fff3cd !important;
            border-left: 4px solid #ffc107;
          }
          
          .rating {
            display: inline-block;
            padding: 4px 8px;
            background-color: #e9ecef;
            border-radius: 4px;
            font-weight: 600;
            font-size: 12px;
          }
          
          .rating.high { background-color: #d4edda; color: #155724; }
          .rating.medium { background-color: #fff3cd; color: #856404; }
          .rating.low { background-color: #f8d7da; color: #721c24; }
          
          .lineup-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          
          .player-card {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
          }
          
          .player-name {
            font-weight: 600;
            font-size: 16px;
            color: #333;
            margin-bottom: 5px;
          }
          
          .player-role {
            color: #666;
            font-size: 14px;
          }
          
          .notes {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #6c757d;
            font-style: italic;
            color: #666;
          }
          
          .vod-link {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 6px;
            text-decoration: none;
            display: inline-block;
            font-weight: 600;
            margin-top: 15px;
          }
          
          @media print {
            body { background-color: white; }
            .section { break-inside: avoid; }
            .map-card { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${match.opponent} vs ${match.team.name}</h1>
          <div class="subtitle">
            ${match.tournament || 'Scrimmage'} ${match.stage ? `- ${match.stage}` : ''} | ${matchDate}
          </div>
        </div>

        <div class="match-info">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Result</div>
              <div class="info-value">
                ${match.result ? `<span class="result-badge ${match.result}">${match.result.toUpperCase()}</span>` : 'TBD'}
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Score</div>
              <div class="info-value">${match.score || 'TBD'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Format</div>
              <div class="info-value">Best of ${match.bestOf}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Duration</div>
              <div class="info-value">${duration}</div>
            </div>
            ${
              mvpPlayer
                ? `
            <div class="info-item">
              <div class="info-label">MVP</div>
              <div class="info-value">${mvpPlayer.player.gamerTag}</div>
            </div>
            `
                : ''
            }
          </div>
        </div>

        ${
          match.lineup
            ? `
        <div class="section">
          <div class="section-header">Team Lineup</div>
          <div class="section-content">
            <div class="lineup-grid">
              ${match.lineup.slots
                .map(
                  (slot: any) => `
                <div class="player-card">
                  <div class="player-name">${slot.player.gamerTag}</div>
                  <div class="player-role">${slot.role || slot.player.role || 'Player'}</div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>
        `
            : ''
        }

        ${
          match.maps.length > 0
            ? `
        <div class="section">
          <div class="section-header">Map Results</div>
          <div class="section-content">
            <div class="maps-container">
              ${match.maps
                .map(
                  (map: any, index: number) => `
                <div class="map-card">
                  <div class="map-header">
                    <span>Game ${map.gameIdx}: ${map.title}${map.mapName ? ` - ${map.mapName}` : ''}</span>
                    <span class="map-score">${map.ourScore} - ${map.theirScore}</span>
                  </div>
                  ${
                    map.playerStats.length > 0
                      ? `
                  <table class="stats-table">
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>Role</th>
                        <th>Rating</th>
                        ${this.getStatsHeaders(map.title)
                          .map((header: string) => `<th>${header}</th>`)
                          .join('')}
                      </tr>
                    </thead>
                    <tbody>
                      ${map.playerStats
                        .map(
                          (stat: any) => `
                        <tr ${stat.isMvp ? 'class="mvp"' : ''}>
                          <td><strong>${stat.player.gamerTag}</strong></td>
                          <td>${stat.role || stat.player.role || '-'}</td>
                          <td>
                            ${stat.rating ? `<span class="rating ${this.getRatingClass(stat.rating)}">${stat.rating}</span>` : '-'}
                          </td>
                          ${this.getStatsValues(map.title, stat.statsJson)
                            .map((value: string) => `<td>${value}</td>`)
                            .join('')}
                        </tr>
                      `
                        )
                        .join('')}
                    </tbody>
                  </table>
                  `
                      : ''
                  }
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>
        `
            : ''
        }

        ${
          match.notes
            ? `
        <div class="section">
          <div class="section-header">Notes</div>
          <div class="section-content">
            <div class="notes">${match.notes.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
        `
            : ''
        }

        ${
          match.vodUrl
            ? `
        <div class="section">
          <div class="section-header">VOD</div>
          <div class="section-content">
            <a href="${match.vodUrl}" class="vod-link" target="_blank">Watch VOD</a>
          </div>
        </div>
        `
            : ''
        }
      </body>
      </html>
    `;
  }

  private formatMatchForExport(match: any): MatchResponse {
    return {
      id: match.id,
      tenantId: match.tenantId,
      eventId: match.eventId,
      teamId: match.teamId,
      lineupId: match.lineupId,
      opponent: match.opponent,
      tournament: match.tournament,
      stage: match.stage,
      bestOf: match.bestOf || 1,
      startedAt: match.startedAt?.toISOString(),
      endedAt: match.endedAt?.toISOString(),
      status: match.status,
      result: match.result,
      score: match.score,
      vodUrl: match.vodUrl,
      notes: match.notes,
      createdBy: match.createdBy,
      createdAt: match.createdAt?.toISOString(),
      updatedAt: match.updatedAt?.toISOString(),
    };
  }

  private calculateMatchDuration(match: any): string {
    if (!match.startedAt || !match.endedAt) {
      return 'Unknown';
    }

    const start = new Date(match.startedAt);
    const end = new Date(match.endedAt);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  private getStatsHeaders(gameTitle: string): string[] {
    const title = gameTitle?.toLowerCase() || '';

    if (title.includes('valorant') || title.includes('val')) {
      return ['K', 'D', 'A', 'Plants', 'Defuses', 'FK', 'ADR'];
    }

    if (title.includes('lol') || title.includes('league')) {
      return ['K', 'D', 'A', 'CS', 'Gold', 'Damage', 'Wards'];
    }

    if (title.includes('overwatch') || title.includes('ow')) {
      return ['Elims', 'Deaths', 'Damage', 'Healing', 'Obj Kills'];
    }

    if (title.includes('rocket') || title.includes('rl')) {
      return ['Goals', 'Assists', 'Saves', 'Shots', 'Score'];
    }

    return ['Score'];
  }

  private getStatsValues(gameTitle: string, statsJson: any): string[] {
    const title = gameTitle?.toLowerCase() || '';

    if (title.includes('valorant') || title.includes('val')) {
      return [
        statsJson.kills || '0',
        statsJson.deaths || '0',
        statsJson.assists || '0',
        statsJson.plants || '0',
        statsJson.defuses || '0',
        statsJson.firstKills || '0',
        statsJson.adr ? Math.round(statsJson.adr).toString() : '0',
      ];
    }

    if (title.includes('lol') || title.includes('league')) {
      return [
        statsJson.kills || '0',
        statsJson.deaths || '0',
        statsJson.assists || '0',
        statsJson.cs || '0',
        statsJson.gold || '0',
        statsJson.damage || '0',
        statsJson.wards || '0',
      ];
    }

    if (title.includes('overwatch') || title.includes('ow')) {
      return [
        statsJson.eliminations || '0',
        statsJson.deaths || '0',
        statsJson.damage || '0',
        statsJson.healing || '0',
        statsJson.objectiveKills || '0',
      ];
    }

    if (title.includes('rocket') || title.includes('rl')) {
      return [
        statsJson.goals || '0',
        statsJson.assists || '0',
        statsJson.saves || '0',
        statsJson.shots || '0',
        statsJson.score || '0',
      ];
    }

    return [statsJson.score || '0'];
  }

  private getRatingClass(rating: number): string {
    if (rating >= 1.5) return 'high';
    if (rating >= 1.0) return 'medium';
    return 'low';
  }
}
