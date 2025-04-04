// Data module for region information and investigators
const regions = {
    'Region 1': {
        color: '#A9A9A9', // Gray
        counties: ['Benton', 'Clatsop', 'Columbia', 'Lincoln', 'Linn', 'Marion', 'Polk', 'Tillamook', 'Yamhill'],
        investigators: [
            {
                name: "Russ Darling",
                title: "Senior Field Investigator",
                phone: "971-599-0678",
                email: "russ.darling@dcbs.oregon.gov",
                photo: "https://randomuser.me/api/portraits/men/1.jpg",
                counties: ['Benton', 'Lincoln', 'Linn', 'Marion']
            },
            {
                name: "Sarah Johnson",
                title: "Field Investigator",
                phone: "971-599-1234",
                email: "sarah.johnson@dcbs.oregon.gov",
                photo: "https://randomuser.me/api/portraits/women/1.jpg",
                counties: ['Clatsop', 'Columbia', 'Polk', 'Tillamook', 'Yamhill']
            }
        ]
    },
    'Region 2': {
        color: '#006699', // Blue
        counties: ['Coos', 'Curry', 'Douglas', 'Jackson', 'Josephine', 'Lane'],
        investigators: [
            {
                name: "Jeffrey Pritchett",
                title: "Field Investigator",
                phone: "971-375-3682",
                email: "jeffrey.pritchett@dcbs.oregon.gov",
                photo: "https://randomuser.me/api/portraits/men/2.jpg",
                counties: ['Coos', 'Curry', 'Douglas']
            },
            {
                name: "Maria Rodriguez",
                title: "Field Investigator",
                phone: "971-375-4578",
                email: "maria.rodriguez@dcbs.oregon.gov",
                photo: "https://randomuser.me/api/portraits/women/2.jpg",
                counties: ['Jackson', 'Josephine', 'Lane']
            }
        ]
    },
    'Region 3': {
        color: '#2F4F4F', // Dark green
        counties: ['Clackamas', 'Gilliam', 'Hood River', 'Jefferson', 'Sherman', 'Wasco', 'Wheeler'],
        investigators: [
            {
                name: "Phillip Padilla",
                title: "Field Investigator",
                phone: "541-240-0359",
                email: "phillip.padilla@dcbs.oregon.gov",
                photo: "https://randomuser.me/api/portraits/men/3.jpg",
                counties: ['Clackamas', 'Hood River', 'Wasco']
            },
            {
                name: "Emily Chen",
                title: "Field Investigator Specialist",
                phone: "541-240-5629",
                email: "emily.chen@dcbs.oregon.gov",
                photo: "https://randomuser.me/api/portraits/women/3.jpg",
                counties: ['Gilliam', 'Jefferson', 'Sherman', 'Wheeler']
            }
        ]
    },
    'Region 4': {
        color: '#996600', // Brown
        counties: ['Baker', 'Crook', 'Deschutes', 'Grant', 'Harney', 'Klamath', 'Lake', 'Malheur', 'Morrow', 'Umatilla', 'Union', 'Wallowa'],
        investigators: [
            {
                name: "David Peery",
                title: "Senior Field Investigator",
                phone: "541-359-6208",
                email: "david.peery@dcbs.oregon.gov",
                photo: "https://randomuser.me/api/portraits/men/4.jpg",
                counties: ['Baker', 'Grant', 'Morrow', 'Umatilla', 'Union', 'Wallowa']
            },
            {
                name: "Lisa Martinez",
                title: "Field Investigator",
                phone: "541-359-7512",
                email: "lisa.martinez@dcbs.oregon.gov",
                photo: "https://randomuser.me/api/portraits/women/4.jpg",
                counties: ['Crook', 'Deschutes', 'Harney', 'Klamath', 'Lake', 'Malheur']
            }
        ]
    },
    'Region 5': {
        color: '#FF6600', // Orange
        counties: ['Multnomah', 'Washington'],
        investigators: [
            {
                name: "James Wilson",
                title: "Lead Field Investigator",
                phone: "971-599-8542",
                email: "james.wilson@dcbs.oregon.gov",
                photo: "https://randomuser.me/api/portraits/men/5.jpg",
                counties: ['Multnomah']
            },
            {
                name: "Michelle Park",
                title: "Field Investigator",
                phone: "971-599-3219",
                email: "michelle.park@dcbs.oregon.gov",
                photo: "https://randomuser.me/api/portraits/women/5.jpg",
                counties: ['Washington']
            }
        ]
    }
};

export { regions };
