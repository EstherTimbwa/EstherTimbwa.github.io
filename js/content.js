/*
  All text on the site lives here. Edit this file to update the page;
  the layout in index.html / main.js reads from it and never needs touching.

  Conventions
  - Scenes render in the order they appear in `scenes`.
  - Headline lines: { text, outline: true } draws the line as outlined text.
  - Placeholders in [SQUARE BRACKETS] mark details still to be filled in.
  - Project images: images: [] shows a typographic cover; one image shows it;
    several images cycle inside the card. Give an image `demo: 'https://...'`
    (and a short `name`) to add a "View live demo" link for it.
*/

export const content = {
  site: {
    name: 'Esther Timbwa',
    email: 'estherundisa09@gmail.com',
    location: 'Nairobi, Kenya',
    cv: {
      enabled: false, // true shows the "Download CV" button (put the file at assets/cv.pdf first)
      href: 'assets/cv.pdf',
      downloadName: 'EstherTimbwa_CV_2026.pdf',
    },
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/esther-timbwa-388244201' },
      { label: 'GitHub', href: 'https://github.com/EstherTimbwa' },
    ],
  },

  scenes: [
    {
      id: 'intro',
      nav: 'Intro',
      label: 'Web developer / QA / Tech support',
      headline: [
        { text: 'I build' },
        { text: 'websites.' },
        { text: 'Then I test them.', outline: true },
      ],
      text:
        "I'm Esther, a freelance web developer in Nairobi. I build e-commerce websites for small businesses, and my background in QA testing and technical support means I check the details before anything goes live.",
    },

    {
      id: 'work',
      nav: 'Work',
      bigWord: 'Work',
      label: 'Selected projects',
      heading: "Things I've built.",
      projects: [
        {
          type: 'Shopify store',
          title: 'Weme Hair',
          client: 'Weme Hair',
          private: false,
          description:
            'Shopify store for premium hair extensions and glueless wigs, built for customers in Europe, the UK and the US.',
          status: 'Launching soon', // small tag on the card; set to '' once live
          // No screenshot yet, so the card shows a typographic cover with the title.
          // To use a screenshot: images: [{ src: 'assets/projects/weme-hair.webp', alt: 'Weme Hair store homepage' }]
          images: [],
          url: 'https://weme-hair.myshopify.com/',
          live: false, // the link only shows when live: true
        },
        {
          type: 'Custom build / Firebase',
          title: 'Hair studio booking site',
          client: '[CLIENT NAME]',
          private: true, // true = client name is never shown on the site
          description:
            'Booking site built with custom HTML, CSS and JavaScript on Firebase, with payment and onboarding flows.',
          images: [
            { src: 'assets/projects/booking-site.webp', alt: 'Homepage of the hair studio booking site, with client details blurred' },
          ],
          url: '',
        },
        {
          type: 'Own product',
          title: 'Website starter kits',
          client: '',
          private: false,
          description:
            'Ready-made websites for hair, beauty and nail businesses, adapted from my client work into reusable starters.',
          tags: ['Hair', 'Beauty', 'Nails'],
          // more than one image = the card cycles through them
          // demo: live demo URL for that screenshot (opens in a new tab); name labels the link
          images: [
            { src: 'assets/projects/hair-marketplace-kit.webp', alt: 'Hair marketplace starter kit homepage', name: 'Hair marketplace', demo: 'https://esther-hair-marketplace-demo.netlify.app' },
            { src: 'assets/projects/hairstylist-kit.webp', alt: 'Hairstylist starter kit homepage', name: 'Hairstylist', demo: 'https://esther-hairstylist-demo.netlify.app' },
            { src: 'assets/projects/nail-tech-kit.webp', alt: 'Nail technician starter kit homepage', name: 'Nail tech', demo: 'https://esther-nail-tech-demo.netlify.app' },
          ],
          url: '',
        },
      ],
    },

    {
      id: 'experience',
      nav: 'Experience',
      bigWord: 'Experience',
      label: 'Experience',
      heading: "Where I've worked.",
      roles: [
        {
          title: 'Freelance Web Developer',
          org: 'E-commerce website building',
          place: 'Self-employed, remote',
          dates: '2025 – Present',
          summary:
            'Build and launch e-commerce sites for small businesses end to end, from scoping and pricing to payments, copy and delivery. Freelance functional testing through Testlio alongside.',
          tags: ['Shopify', 'Firebase', 'Stripe', 'PayPal'],
        },
        {
          title: 'Functional QA Tester',
          org: 'Testronic',
          place: 'Warsaw, Poland',
          dates: '2023 – 2024',
          summary:
            'Tested software releases with engineering, QA and project teams, tracked issues in Jira and Confluence, and helped integrate automated tests into Jenkins pipelines.',
          tags: ['Jira', 'Confluence', 'Jenkins', 'Grafana'],
        },
        {
          title: 'Technical Support Specialist',
          org: 'Insurance Supermarket Inc.',
          place: 'Remote',
          dates: '2022 – 2023',
          summary:
            'Troubleshot network, software and configuration issues, managed Active Directory and Office 365, and wrote troubleshooting guides that reduced recurring requests.',
          tags: ['Windows Server', 'Active Directory', 'Office 365', 'SQL'],
        },
      ],
    },

    {
      id: 'skills',
      nav: 'Skills',
      bigWord: 'Skills',
      label: 'Skills',
      heading: 'Build it. Break it. Support it.',
      groups: [
        {
          title: 'Build',
          text: 'Websites and stores that are fast, clear and easy to run.',
          skills: ['HTML', 'CSS', 'JavaScript', 'Shopify', 'Theme customization', 'Firebase', 'Stripe', 'PayPal', 'Git'],
        },
        {
          title: 'Test and secure',
          text: 'Finding what breaks before your customers do.',
          skills: ['Functional testing', 'Regression testing', 'Bug reporting', 'Jira', 'Confluence', 'SQL', 'Log analysis (ELK)', 'Ethical hacking labs', 'CTF challenges'],
        },
        {
          title: 'Ship and support',
          text: 'Deploying, monitoring and helping people when something goes wrong.',
          skills: ['Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitHub Actions', 'AWS', 'Prometheus', 'Grafana', 'Linux', 'Windows Server', 'Office 365', 'Technical documentation'],
        },
      ],
    },

    {
      id: 'education',
      nav: 'Education',
      bigWord: 'Study',
      label: 'Education',
      heading: 'What I studied.',
      entries: [
        {
          title: "Bachelor's degree in Computer Science",
          school: 'Akademia Ekonomiczno-Humanistyczna w Warszawie',
          dates: '2019 – 2024',
          note: 'Programming, databases and networking fundamentals.',
        },
        {
          title: 'Postgraduate Diploma in DevOps Engineering',
          school: 'Purdue University via Edureka (online)',
          dates: '2024 – 2025',
          note: 'AWS, CI/CD with Jenkins, Terraform, Docker, Kubernetes, Ansible, Prometheus and Grafana.',
        },
        {
          title: 'Diploma in Information Security and Ethical Hacking',
          school: 'Institute of Software Technology, Nairobi',
          dates: '2023',
          note: 'SQL injection and privilege escalation labs, log analysis.',
        },
      ],
    },

    {
      id: 'contact',
      nav: 'Contact',
      label: 'Contact',
      headline: [{ text: "Let's work" }, { text: 'together.', outline: true }],
      panels: [
        {
          title: 'Need a website?',
          text: 'Tell me about your business and what you want your site to do.',
          actions: [{ label: 'Start a project', type: 'email', subject: 'New website project' }],
        },
        {
          title: 'Hiring for support?',
          text: 'Open to remote customer and technical support roles. Troubleshooting, QA and clear documentation.',
          actions: [
            { label: 'Download CV', type: 'cv' }, // only shows when site.cv.enabled is true
            { label: 'View LinkedIn', type: 'link', href: 'https://www.linkedin.com/in/esther-timbwa-388244201' },
          ],
        },
      ],
    },
  ],
};
