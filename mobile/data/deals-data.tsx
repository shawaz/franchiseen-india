// Update the deals data structure
const dealsData = {
  applied: [
    {
      id: '1',
      title: 'Tim Hortons Franchise',
      company: 'Tim Hortons',
      duration: 'Phase 0 of 5 • Applied',
      progress: 0,
      amount: '$250k',
      image: { uri: 'https://www.qsrmagazine.com/wp-content/uploads/2024/01/timhortonsstore.jpg' },
      logo: { uri: 'https://play-lh.googleusercontent.com/SrMKCqu-dg-8-l-4YpU3IvocFQT2YAafgz_Ikguu_-rEyWcWo_RMU9ba1Lxl58Weg0U' },
      status: 'applied',
      appliedDate: 'Dec 20, 2023'
    }
  ],
  review: [
    {
      id: '2',
      title: 'Costa Cafe #402',
      company: 'Costa',
      duration: 'Phase 2 of 5 • Review',
      progress: 0.4,
      amount: '$150k',
      image: { uri: 'https://www.costacoffee.com/globalassets/global/images/our-coffees/costa-ristretto.jpg' },
      logo: { uri: 'https://play-lh.googleusercontent.com/axJIlIdVQ2gjtilt-SZjMui6FI_gKCntJKzuvLaK7tob-NlrHSImAjU26IiNx3eV8u8YH64cCXrJ054OKH2Xrw' },
      status: 'review',
      appliedDate: 'Dec 15, 2023'
    }
  ],
  onboarding: [
    {
      id: '3',
      title: 'Subway #126',
      company: 'Subway',
      duration: 'Phase 3 of 5 • Onboarding',
      progress: 0.6,
      amount: '$180k',
      image: { uri: 'https://www.subway.com/ns/images/menu/PHG/ENG/CookieDoughBite_PHG_594x334_72dpi-2020-01.jpg' },
      logo: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTl6XJBCSrqLZwK3aF1nLz0iPPYqJVJWpxR8g&s' },
      status: 'onboarding',
      appliedDate: 'Dec 10, 2023'
    }
  ],
  launching: [
    {
      id: '4',
      title: 'Starbucks Reserve',
      company: 'Starbucks',
      duration: 'Phase 4 of 5 • Launching',
      progress: 0.8,
      amount: '$300k',
      image: { uri: 'https://www.starbucks.com/weblx/images/reserve/our-locations/roastery-chicago/roastery-chicago-hero-mobile.jpg' },
      logo: { uri: 'https://play-lh.googleusercontent.com/AmsoDO05un1Eul_iKuOGu10S0r10jV6c1-3eOTEEczzz0LGUlnkcS0I07ww9MkWpng=s360-rw' },
      status: 'launching',
      appliedDate: 'Dec 5, 2023'
    }
  ],
  live: [
    {
      id: '5',
      title: 'McDonalds Franchise',
      company: 'McDonalds',
      duration: 'Phase 5 of 5 • Live',
      progress: 1,
      amount: '$500k',
      image: { uri: 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/images/1PUB_McD_App_Header_Desktop_2336x1040.jpg' },
      logo: { uri: 'https://thumbs.dreamstime.com/b/web-183282388.jpg' },
      status: 'live',
      appliedDate: 'Dec 1, 2023'
    }
  ]
};

export { dealsData };
