const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const { from, to } of replacements) {
        content = content.replace(from, to);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${filePath}`);
    }
}

// 1. Reservations.jsx
replaceInFile(path.join(__dirname, 'src/features/reservations/Reservations.jsx'), [
    { from: /import \{ formatVND, formatDate, formatDateTime \} from '@shared\/utils\/format';/g, to: "import { formatVND, formatDate } from '@shared/utils/format';" },
    { from: /import \{ RESERVATION_STATUS, ROOM_STATUS, ROLE_BADGE \} from '@shared\/constants\/statusMaps';/g, to: "import { RESERVATION_STATUS } from '@shared/constants/statusMaps';" },
    { from: /useEffect\(\(\) => \{ fetchReservations\(\); \}, \[\]\);/g, to: "" },
    { from: /async function fetchReservations\(\) \{/g, to: "useEffect(() => { fetchReservations(); }, []);\n\n  async function fetchReservations() {" }
]);

// 2. ReservationGuests.jsx (assuming it might have the same issues)
if (fs.existsSync(path.join(__dirname, 'src/features/reservations/ReservationGuests.jsx'))) {
    replaceInFile(path.join(__dirname, 'src/features/reservations/ReservationGuests.jsx'), [
        { from: /import \{ formatVND, formatDate, formatDateTime \} from '@shared\/utils\/format';/g, to: "import { formatVND, formatDate } from '@shared/utils/format';" },
        { from: /import \{ RESERVATION_STATUS, ROOM_STATUS, ROLE_BADGE \} from '@shared\/constants\/statusMaps';/g, to: "import { RESERVATION_STATUS } from '@shared/constants/statusMaps';" },
        { from: /useEffect\(\(\) => \{ fetchBookings\(\); \}, \[\]\);/g, to: "" },
        { from: /async function fetchBookings\(\) \{/g, to: "useEffect(() => { fetchBookings(); }, []);\n\n  async function fetchBookings() {" }
    ]);
}

// 3. AdminDashboard.jsx (Wait, UserHome.jsx or Dashboard.jsx? The ESLint output says "AdminDashboard.jsx"? No, it just said `fetchBookings` in a file.)
// Let's search for fetchBookings in src/features/dashboard if it exists.
const dashboardDir = path.join(__dirname, 'src/features/dashboard');
if (fs.existsSync(dashboardDir)) {
    fs.readdirSync(dashboardDir).forEach(f => {
        if (f.endsWith('.jsx')) {
            replaceInFile(path.join(dashboardDir, f), [
                { from: /import \{ RESERVATION_STATUS, ROOM_STATUS, ROLE_BADGE \} from '@shared\/constants\/statusMaps';/g, to: "import { RESERVATION_STATUS, ROOM_STATUS } from '@shared/constants/statusMaps';" },
                { from: /useEffect\(\(\) => \{ fetchBookings\(\); \}, \[\]\);/g, to: "" },
                { from: /async function fetchBookings\(\) \{/g, to: "useEffect(() => { fetchBookings(); }, []);\n\n  async function fetchBookings() {" },
                { from: /useEffect\(\(\) => \{ fetchData\(\); \}, \[\]\);/g, to: "" },
                { from: /async function fetchData\(\) \{/g, to: "useEffect(() => { fetchData(); }, []);\n\n  async function fetchData() {" }
            ]);
        }
    });
}

// 4. Rooms.jsx
replaceInFile(path.join(__dirname, 'src/features/rooms/Rooms.jsx'), [
    { from: /import \{ formatVND, formatDate, formatDateTime \} from '@shared\/utils\/format';/g, to: "import { formatVND } from '@shared/utils/format';" },
    { from: /import \{ formatVND, formatDate \} from '@shared\/utils\/format';/g, to: "import { formatVND } from '@shared/utils/format';" },
]);

// 5. Services.jsx
replaceInFile(path.join(__dirname, 'src/features/services/Services.jsx'), [
    { from: /import \{ formatVND, formatDate, formatDateTime \} from '@shared\/utils\/format';/g, to: "import { formatVND } from '@shared/utils/format';" }
]);

// 6. Users.jsx
replaceInFile(path.join(__dirname, 'src/features/users/Users.jsx'), [
    { from: /import \{ Users as UsersIcon, Plus, Edit2, Trash2, Shield, Mail, Phone, MapPin, User, Search, Settings, ClipboardList \} from 'lucide-react';/g, to: "import { Users as UsersIcon, Plus, Edit2, Trash2, Shield, Mail, Phone, MapPin, User, Search } from 'lucide-react';" },
    { from: /import \{ RESERVATION_STATUS, ROOM_STATUS, ROLE_BADGE \} from '@shared\/constants\/statusMaps';/g, to: "import { ROLE_BADGE } from '@shared/constants/statusMaps';" },
    { from: /useEffect\(\(\) => \{ fetchData\(\); \}, \[\]\);/g, to: "" },
    { from: /async function fetchData\(\) \{/g, to: "useEffect(() => { fetchData(); }, []);\n\n  async function fetchData() {" }
]);

// 7. useFetch.js
replaceInFile(path.join(__dirname, 'src/shared/hooks/useFetch.js'), [
    { from: /\}, \[apiFn\]\);/g, to: "}, [apiFn, onError, onSuccess]);" }
]);

console.log("ESLint auto-fix script completed.");
