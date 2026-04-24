// ============================================
// GigSphere – Mock Data (Seed)
// ============================================

export const mockUsers = [
  {
    id: 's1', role: 'student', name: 'Alex Rivera', email: 'alex@example.com',
    password: 'password123', skills: ['React', 'JavaScript', 'UI Design'],
    availability: 'Weekends & Evenings', location: 'Bhopal', rating: 4.8, avatar: '🧑‍💻'
  },
  {
    id: 's2', role: 'student', name: 'Priya Verma', email: 'priya@example.com',
    password: 'password123', skills: ['Python', 'Data Entry', 'Excel'],
    availability: 'Flexible', location: 'Bhopal', rating: 4.5, avatar: '👩‍🎓'
  },
  {
    id: 's3', role: 'student', name: 'Ankit Singh', email: 'ankit@example.com',
    password: 'password123', skills: ['Photography', 'Video Editing', 'Social Media'],
    availability: 'Weekends', location: 'Indore', rating: 4.9, avatar: '📸'
  },
  {
    id: 'b1', role: 'business', name: 'TechStart Inc.', email: 'techstart@example.com',
    password: 'password123', industry: 'Technology', location: 'Bhopal', rating: 4.6, avatar: '🏢'
  },
  {
    id: 'b2', role: 'business', name: 'EventPro Solutions', email: 'eventpro@example.com',
    password: 'password123', industry: 'Events & Hospitality', location: 'Indore', rating: 4.3, avatar: '🎪'
  }
];

export const mockGigs = [
  {
    id: 'g1', businessId: 'b1', businessName: 'TechStart Inc.', title: 'Shop Helper',
    description: 'Assist with daily shop operations including inventory management, customer service, and product displays. Perfect for students looking for flexible work.',
    skills: ['Customer Service', 'Organization'], pay: '₹500/day', duration: '1 week',
    location: 'Bhopal', category: 'skilled', status: 'open', urgent: true,
    postedAt: '2026-04-15T10:00:00Z'
  },
  {
    id: 'g2', businessId: 'b2', businessName: 'EventPro Solutions', title: 'Event Assistant',
    description: 'Help coordinate and manage events, handle registrations, manage schedules, and assist with event logistics. Great for people-oriented students.',
    skills: ['Communication', 'Organization', 'Teamwork'], pay: '₹750/day', duration: '3 days',
    location: 'Bhopal', category: 'admin', status: 'open', urgent: false,
    postedAt: '2026-04-16T09:00:00Z'
  },
  {
    id: 'g3', businessId: 'b1', businessName: 'TechStart Inc.', title: 'Food Delivery',
    description: 'Deliver food orders to customers in the local area. Must have own transportation. Flexible hours with competitive pay.',
    skills: ['Navigation', 'Time Management'], pay: '₹200/hr', duration: 'Ongoing',
    location: 'Indore', category: 'skilled', status: 'open', urgent: false,
    postedAt: '2026-04-17T14:00:00Z'
  },
  {
    id: 'g4', businessId: 'b1', businessName: 'TechStart Inc.', title: 'React Frontend Developer',
    description: 'Build responsive dashboard components for our SaaS product. Must know React, CSS, and modern JS.',
    skills: ['React', 'JavaScript', 'CSS'], pay: '₹1500/day', duration: '2 weeks',
    location: 'Remote', category: 'tech', status: 'open', urgent: true,
    postedAt: '2026-04-18T08:00:00Z'
  },
  {
    id: 'g5', businessId: 'b2', businessName: 'EventPro Solutions', title: 'Social Media Manager',
    description: 'Create engaging social media content, schedule posts, and manage community interactions for our brand.',
    skills: ['Social Media', 'Content Creation', 'Photography'], pay: '₹800/day', duration: '1 month',
    location: 'Bhopal', category: 'creative', status: 'in-progress', urgent: false,
    postedAt: '2026-04-10T11:00:00Z'
  }
];

export const mockApplications = [
  {
    id: 'a1', gigId: 'g4', studentId: 's1', userName: 'Alex Rivera', businessId: 'b1',
    status: 'accepted', appliedAt: '2026-04-18T12:00:00Z',
    coverLetter: 'I have strong React skills and would love to work on your dashboard.'
  },
  {
    id: 'a2', gigId: 'g5', studentId: 's3', userName: 'Ankit Singh', businessId: 'b2',
    status: 'completed', appliedAt: '2026-04-11T10:00:00Z',
    coverLetter: 'Photography and social media are my passion!'
  },
  {
    id: 'a3', gigId: 'g2', studentId: 's2', userName: 'Priya Verma', businessId: 'b2',
    status: 'pending', appliedAt: '2026-04-19T15:00:00Z',
    coverLetter: 'I am very organized and love helping at events.'
  },
  {
    id: 'a4', gigId: 'g1', studentId: 's1', userName: 'Alex Rivera', businessId: 'b1',
    status: 'rejected', appliedAt: '2026-04-16T08:00:00Z',
    coverLetter: 'Looking for extra work on weekends.'
  }
];

export const mockMessages = [
  {
    id: 'm1', applicationId: 'a1', senderId: 's1',
    text: 'Hi! I\'m excited to start working on the dashboard.',
    timestamp: '2026-04-19T10:00:00Z'
  },
  {
    id: 'm2', applicationId: 'a1', senderId: 'b1',
    text: 'Welcome aboard! Let me share the design specs with you.',
    timestamp: '2026-04-19T10:05:00Z'
  },
  {
    id: 'm3', applicationId: 'a1', senderId: 's1',
    text: 'Sounds great. I\'ll start with the navigation component.',
    timestamp: '2026-04-19T10:10:00Z'
  },
  {
    id: 'm4', applicationId: 'a2', senderId: 'b2',
    text: 'Great work on the social media campaign!',
    timestamp: '2026-04-20T09:00:00Z'
  }
];

export const mockPayments = [
  {
    id: 'p1', applicationId: 'a2', gigId: 'g5',
    fromId: 'b2', toId: 's3', amount: 800,
    status: 'completed', paidAt: '2026-04-21T10:00:00Z'
  }
];

export const mockReviews = [
  {
    id: 'r1', gigId: 'g5', reviewerId: 'b2', reviewerName: 'EventPro Solutions', revieweeId: 's3',
    rating: 5, comment: 'Ankit did an amazing job with our social media. Highly recommended!',
    createdAt: '2026-04-21T12:00:00Z'
  },
  {
    id: 'r2', gigId: 'g5', reviewerId: 's3', reviewerName: 'Ankit Singh', revieweeId: 'b2',
    rating: 4, comment: 'Great to work with EventPro. Clear communication and fair pay.',
    createdAt: '2026-04-21T13:00:00Z'
  }
];
