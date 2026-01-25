export interface LocationData {
  [continent: string]: {
    [country: string]: string[];
  };
}

export const locationData: LocationData = {
  Europe: {
    Germany: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart'],
    'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow'],
    France: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
    Spain: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao'],
    Italy: ['Rome', 'Milan', 'Naples', 'Turin', 'Florence'],
    Netherlands: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
    Ireland: ['Dublin', 'Cork', 'Galway', 'Limerick'],
    Poland: ['Warsaw', 'Krakow', 'Wroclaw', 'Poznan', 'Gdansk'],
  },
  'North America': {
    'United States': ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Boston', 'Seattle', 'Austin'],
    Canada: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
    Mexico: ['Mexico City', 'Guadalajara', 'Monterrey', 'Cancun'],
  },
  Asia: {
    India: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'],
    China: ['Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou', 'Hangzhou'],
    Japan: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya'],
    Singapore: ['Singapore'],
    'South Korea': ['Seoul', 'Busan', 'Incheon'],
  },
  'Middle East': {
    'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah'],
    Israel: ['Tel Aviv', 'Jerusalem', 'Haifa'],
    Turkey: ['Istanbul', 'Ankara', 'Izmir'],
  },
  Oceania: {
    Australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
    'New Zealand': ['Auckland', 'Wellington', 'Christchurch'],
  },
};

export const refugeeOriginCountries = [
  'Syria',
  'Afghanistan',
  'Iraq',
  'Ukraine',
  'Venezuela',
  'Myanmar',
  'South Sudan',
  'Somalia',
  'Eritrea',
  'Sudan',
];
