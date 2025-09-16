
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

async function seedSampleData() {
  console.log('🌱 Seeding sample data...');

  try {
    // Sample user profiles
    const sampleProfiles = [
      {
        wallet_address: '0x742cf61d1a22a5e10c12f6fd35b6a3b4c4f4e95a',
        name: 'Alice Chen',
        role: 'funder',
        bio: 'Blockchain investor focused on DeFi and education initiatives',
        reputation_score: 95,
        stake_amount: 5000,
        voting_power: 5200
      },
      {
        wallet_address: '0x8ba1f109551bd432803012645hac136c2c1a7e8b',
        name: 'Bob Martinez',
        role: 'grantee',
        bio: 'Full-stack developer building decentralized applications',
        reputation_score: 78,
        stake_amount: 1500,
        voting_power: 1650
      },
      {
        wallet_address: '0x1a2b3c4d5e6f789012345678901234567890abcd',
        name: 'Carol Johnson',
        role: 'auditor',
        bio: 'Smart contract security auditor with 5+ years experience',
        reputation_score: 120,
        stake_amount: 3000,
        voting_power: 3500
      }
    ];

    console.log('📋 Creating user profiles...');
    const { data: profiles, error: profileError } = await supabaseClient
      .from('user_profiles')
      .insert(sampleProfiles)
      .select();

    if (profileError) {
      console.warn('Profile insertion warning:', profileError.message);
    } else {
      console.log(`✅ Created ${profiles.length} user profiles`);
    }

    // Sample grants
    const sampleGrants = [
      {
        title: 'DeFi Education Platform',
        description: 'Comprehensive educational platform for decentralized finance concepts, featuring interactive tutorials, real-world case studies, and hands-on exercises.',
        category: 'Education',
        total_amount: 50000,
        duration_days: 180,
        funder_wallet: '0x742cf61d1a22a5e10c12f6fd35b6a3b4c4f4e95a',
        grantee_wallet: '0x8ba1f109551bd432803012645hac136c2c1a7e8b',
        status: 'active',
        application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        start_date: new Date(),
        blockchain_network: 'sepolia'
      },
      {
        title: 'Smart Contract Security Audit Tools',
        description: 'Development of automated tools for smart contract vulnerability detection and security analysis.',
        category: 'Security',
        total_amount: 75000,
        duration_days: 120,
        funder_wallet: '0x742cf61d1a22a5e10c12f6fd35b6a3b4c4f4e95a',
        status: 'active',
        application_deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        blockchain_network: 'sepolia'
      },
      {
        title: 'Community DAO Governance Platform',
        description: 'Building a user-friendly interface for DAO governance, voting, and proposal management.',
        category: 'Governance',
        total_amount: 35000,
        duration_days: 90,
        funder_wallet: '0x742cf61d1a22a5e10c12f6fd35b6a3b4c4f4e95a',
        status: 'draft',
        blockchain_network: 'sepolia'
      }
    ];

    console.log('🎯 Creating sample grants...');
    const { data: grants, error: grantError } = await supabaseClient
      .from('grants')
      .insert(sampleGrants)
      .select();

    if (grantError) {
      console.error('Grant insertion failed:', grantError);
      return;
    }

    console.log(`✅ Created ${grants.length} grants`);

    // Sample milestones for the first grant
    const sampleMilestones = [
      {
        grant_id: grants[0].id,
        title: 'Platform Architecture & Design',
        description: 'Complete system architecture design and technical specifications',
        deliverables: 'Architecture document, wireframes, technical specifications',
        amount: 15000,
        order_index: 0,
        due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        status: 'pending'
      },
      {
        grant_id: grants[0].id,
        title: 'Core Platform Development',
        description: 'Develop core functionality including user authentication, course management, and progress tracking',
        deliverables: 'Working MVP with core features, test suite, documentation',
        amount: 25000,
        order_index: 1,
        due_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
        status: 'pending'
      },
      {
        grant_id: grants[0].id,
        title: 'Beta Launch & Community Testing',
        description: 'Launch beta version, gather community feedback, and implement improvements',
        deliverables: 'Beta platform, user feedback analysis, improvement implementation',
        amount: 10000,
        order_index: 2,
        due_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
        status: 'pending'
      }
    ];

    console.log('🎯 Creating milestones...');
    const { data: milestones, error: milestoneError } = await supabaseClient
      .from('milestones')
      .insert(sampleMilestones)
      .select();

    if (milestoneError) {
      console.error('Milestone insertion failed:', milestoneError);
      return;
    }

    console.log(`✅ Created ${milestones.length} milestones`);

    // Sample grant applications
    const sampleApplications = [
      {
        grant_id: grants[1].id, // Smart Contract Security Audit Tools
        applicant_wallet: '0x1a2b3c4d5e6f789012345678901234567890abcd',
        proposal_title: 'Advanced Security Audit Framework',
        proposal_description: 'Comprehensive proposal for building automated security audit tools with ML-powered vulnerability detection.',
        requested_amount: 75000,
        status: 'pending',
        attachments: JSON.stringify([
          { name: 'technical_proposal.pdf', size: 2048000 },
          { name: 'team_profile.pdf', size: 1024000 }
        ])
      }
    ];

    console.log('📝 Creating grant applications...');
    const { data: applications, error: applicationError } = await supabaseClient
      .from('grant_applications')
      .insert(sampleApplications)
      .select();

    if (applicationError) {
      console.error('Application insertion failed:', applicationError);
      return;
    }

    console.log(`✅ Created ${applications.length} grant applications`);

    // Sample notifications
    const sampleNotifications = [
      {
        user_wallet: '0x8ba1f109551bd432803012645hac136c2c1a7e8b',
        title: 'Grant Awarded!',
        message: 'Congratulations! You have been awarded the DeFi Education Platform grant.',
        type: 'success',
        related_grant_id: grants[0].id
      },
      {
        user_wallet: '0x742cf61d1a22a5e10c12f6fd35b6a3b4c4f4e95a',
        title: 'New Grant Application',
        message: 'You have received a new application for your Smart Contract Security Audit Tools grant.',
        type: 'info',
        related_grant_id: grants[1].id
      }
    ];

    console.log('🔔 Creating notifications...');
    const { data: notifications, error: notificationError } = await supabaseClient
      .from('notifications')
      .insert(sampleNotifications)
      .select();

    if (notificationError) {
      console.error('Notification insertion failed:', notificationError);
      return;
    }

    console.log(`✅ Created ${notifications.length} notifications`);

    console.log('\n🎉 Sample data seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`- User Profiles: ${profiles?.length || 0}`);
    console.log(`- Grants: ${grants?.length || 0}`);
    console.log(`- Milestones: ${milestones?.length || 0}`);
    console.log(`- Applications: ${applications?.length || 0}`);
    console.log(`- Notifications: ${notifications?.length || 0}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

// Run the seeder
if (require.main === module) {
  seedSampleData().then(() => {
    console.log('Seeding script completed');
    process.exit(0);
  }).catch(error => {
    console.error('Seeding script failed:', error);
    process.exit(1);
  });
}

module.exports = { seedSampleData };
