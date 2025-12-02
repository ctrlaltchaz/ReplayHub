#!/usr/bin/env node
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from apps/api/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function generatePassword(length = 16) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

async function createAdmin() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔐 Create Admin User');
    console.log('='.repeat(60) + '\n');

    // Get email
    const email = await question('📧 Email address: ');
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      process.exit(1);
    }

    // Check if user already exists
    let globalUser = await prisma.globalUser.findUnique({
      where: { email },
    });

    let password;
    let isNewUser = false;

    if (globalUser) {
      console.log('\n⚠️  User already exists with this email!');
      console.log('   User ID:', globalUser.id);
      console.log('   Current Status:');
      console.log('   - Global Admin:', globalUser.isGlobalAdmin ? '✅ Yes' : '❌ No');
      console.log('   - Active:', globalUser.isActive ? '✅ Yes' : '❌ No');
      console.log('   - Name:', globalUser.name || '(not set)');
      
      const updateExisting = await question('\n🔄 Update this user? (yes/no): ');
      if (updateExisting.toLowerCase() !== 'yes' && updateExisting.toLowerCase() !== 'y') {
        console.log('❌ Cancelled');
        process.exit(0);
      }

      const resetPassword = await question('🔑 Reset password? (yes/no): ');
      if (resetPassword.toLowerCase() === 'yes' || resetPassword.toLowerCase() === 'y') {
        const useCustomPassword = await question('   Use custom password? (yes/no, default: generate): ');
        if (useCustomPassword.toLowerCase() === 'yes' || useCustomPassword.toLowerCase() === 'y') {
          password = await question('   Enter password: ');
        } else {
          password = generatePassword();
        }
      }
    } else {
      isNewUser = true;
      console.log('\n✨ Creating new user...');
      
      // Get optional name
      const name = await question('👤 Full name (optional): ');
      
      // Get password
      const useCustomPassword = await question('🔑 Use custom password? (yes/no, default: generate): ');
      if (useCustomPassword.toLowerCase() === 'yes' || useCustomPassword.toLowerCase() === 'y') {
        password = await question('   Enter password: ');
      } else {
        password = generatePassword();
      }

      // Hash password using argon2 (matching global-auth.service.ts)
      const passwordHash = await argon2.hash(password);

      // Get admin level
      const makeGlobalAdmin = await question('🌐 Make Global Admin? (yes/no): ');
      const isGlobalAdmin = makeGlobalAdmin.toLowerCase() === 'yes' || makeGlobalAdmin.toLowerCase() === 'y';

      // Create user
      globalUser = await prisma.globalUser.create({
        data: {
          email,
          passwordHash,
          isGlobalAdmin,
          isActive: true,
          name: name || null,
        },
      });

      console.log('\n✅ User Created!');
      console.log('   User ID:', globalUser.id);
    }

    // Update existing user if needed
    if (!isNewUser) {
      const makeGlobalAdmin = await question('🌐 Set as Global Admin? (yes/no/skip): ');
      
      const updateData = {};
      
      if (makeGlobalAdmin.toLowerCase() === 'yes' || makeGlobalAdmin.toLowerCase() === 'y') {
        updateData.isGlobalAdmin = true;
      } else if (makeGlobalAdmin.toLowerCase() === 'no' || makeGlobalAdmin.toLowerCase() === 'n') {
        updateData.isGlobalAdmin = false;
      }

      if (password) {
        updateData.passwordHash = await argon2.hash(password);
      }

      updateData.isActive = true;

      if (Object.keys(updateData).length > 0) {
        globalUser = await prisma.globalUser.update({
          where: { id: globalUser.id },
          data: updateData,
        });
        console.log('\n✅ User Updated!');
      }
    }

    // Handle organization admin access
    const manageOrgAccess = await question('\n🏢 Configure organization access? (yes/no): ');
    
    if (manageOrgAccess.toLowerCase() === 'yes' || manageOrgAccess.toLowerCase() === 'y') {
      const orgs = await prisma.organisation.findMany({
        include: {
          _count: {
            select: { orgUsers: true },
          },
        },
      });

      if (orgs.length === 0) {
        console.log('\n⚠️  No organizations found in the database.');
      } else {
        console.log('\n📋 Available Organizations:');
        orgs.forEach((org, index) => {
          console.log(`   ${index + 1}. ${org.name} (${org.slug}) - ${org._count.orgUsers} users`);
        });

        const linkAll = await question('\n🔗 Link to ALL organizations? (yes/no): ');
        
        let linkedCount = 0;
        let skippedCount = 0;

        if (linkAll.toLowerCase() === 'yes' || linkAll.toLowerCase() === 'y') {
          for (const org of orgs) {
            const existing = await prisma.organisationAdmin.findFirst({
              where: {
                organisationId: org.id,
                globalUserId: globalUser.id,
              },
            });

            if (!existing) {
              await prisma.organisationAdmin.create({
                data: {
                  organisationId: org.id,
                  globalUserId: globalUser.id,
                  role: 'owner',
                },
              });
              console.log(`   ✅ Linked to: ${org.name}`);
              linkedCount++;
            } else {
              console.log(`   ℹ️  Already linked: ${org.name}`);
              skippedCount++;
            }
          }
        } else {
          const orgNumbers = await question('   Enter organization numbers (comma-separated, e.g., 1,3,5): ');
          const selectedIndexes = orgNumbers.split(',').map(n => parseInt(n.trim()) - 1);
          
          for (const index of selectedIndexes) {
            if (index >= 0 && index < orgs.length) {
              const org = orgs[index];
              
              const existing = await prisma.organisationAdmin.findFirst({
                where: {
                  organisationId: org.id,
                  globalUserId: globalUser.id,
                },
              });

              if (!existing) {
                await prisma.organisationAdmin.create({
                  data: {
                    organisationId: org.id,
                    globalUserId: globalUser.id,
                    role: 'owner',
                  },
                });
                console.log(`   ✅ Linked to: ${org.name}`);
                linkedCount++;
              } else {
                console.log(`   ℹ️  Already linked: ${org.name}`);
                skippedCount++;
              }
            }
          }
        }

        console.log(`\n📊 Results: ${linkedCount} linked, ${skippedCount} already linked`);
      }
    }

    // Get final state
    const finalUser = await prisma.globalUser.findUnique({
      where: { id: globalUser.id },
      include: {
        organisationAdmins: {
          include: {
            organisation: true,
          },
        },
      },
    });

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ADMIN ACCOUNT READY!');
    console.log('='.repeat(60));
    console.log('📧 Email:       ', finalUser.email);
    console.log('👤 Name:        ', finalUser.name || '(not set)');
    console.log('🌐 Global Admin:', finalUser.isGlobalAdmin ? '✅ Yes' : '❌ No');
    console.log('✅ Active:      ', finalUser.isActive ? 'Yes' : 'No');
    console.log('🏢 Org Access:  ', finalUser.organisationAdmins.length, 'organization(s)');
    
    if (password) {
      console.log('\n🔑 Password:    ', password);
      console.log('⚠️  IMPORTANT: Save this password securely!');
    }
    
    console.log('='.repeat(60));

    if (finalUser.organisationAdmins.length > 0) {
      console.log('\n📋 Organization Access:');
      finalUser.organisationAdmins.forEach(admin => {
        console.log(`   • ${admin.organisation.name} (${admin.role})`);
        console.log(`     → /org/${admin.organisation.slug}`);
      });
    }

    console.log('\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();
