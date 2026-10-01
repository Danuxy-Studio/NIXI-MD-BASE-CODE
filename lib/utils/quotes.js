const quotes = [
    {
        quote: "Meski Komi sulit bicara, hatinya selalu berkomunikasi.",
        by: "Komi Shouko"
    },
    {
        quote: "Kadang, ketenangan adalah cara terbaik untuk berbicara.",
        by: "Komi Shouko"
    },
    {
        quote: "Setiap orang punya cara sendiri untuk terhubung dengan orang lain.",
        by: "Komi Shouko"
    },
    {
        quote: "Kebaikan tidak selalu harus diucapkan, terkadang cukup dirasakan.",
        by: "Komi Shouko"
    },
    {
        quote: "Keberanian bukan hanya tentang bicara, tapi juga tentang mendengarkan.",
        by: "Komi Shouko"
    },
    {
        quote: "Teman sejati adalah mereka yang mengerti keheninganmu.",
        by: "Komi Shouko"
    },
    {
        quote: "Jangan takut untuk menjadi dirimu sendiri. Orang yang tepat akan tetap bertahan.",
        by: "Komi Shouko"
    },
    {
        quote: "Setiap langkah kecil dalam percakapan adalah kemenangan besar.",
        by: "Komi Shouko"
    },
    {
        quote: "Terkadang, senyuman adalah bahasa yang paling universal.",
        by: "Komi Shouko"
    },
    {
        quote: "Hati yang terbuka tidak membutuhkan kata-kata.",
        by: "Komi Shouko"
    },
    {
        quote: "Menjadi pendengar yang baik adalah bentuk cinta yang paling sederhana.",
        by: "Komi Shouko"
    },
    {
        quote: "Jangan bandingkan perjalananmu dengan orang lain. Setiap orang punya kecepatan sendiri.",
        by: "Komi Shouko"
    },
    {
        quote: "Kadang, yang paling berani adalah mereka yang diam.",
        by: "Komi Shouko"
    },
    {
        quote: "Setiap pertemuan dimulai dengan sebuah keberanian kecil.",
        by: "Komi Shouko"
    },
    {
        quote: "Persahabatan adalah tentang saling mengerti, bukan saling berbicara.",
        by: "Komi Shouko"
    },
    {
        quote: "Kamu tidak harus sempurna untuk dicintai.",
        by: "Komi Shouko"
    },
    {
        quote: "Perbedaan bukanlah hambatan, tapi warna dalam hidup.",
        by: "Komi Shouko"
    },
    {
        quote: "Kebaikan kecil bisa membuat dunia terasa lebih hangat.",
        by: "Komi Shouko"
    },
    {
        quote: "Jangan pernah menyerah untuk terhubung dengan orang lain.",
        by: "Komi Shouko"
    },
    {
        quote: "Hari ini adalah hari yang baik untuk memulai sesuatu yang baru.",
        by: "Komi Shouko"
    }
];

export function getRandomQuote() {
    const index = Math.floor(Math.random() * quotes.length);
    return quotes[index];
}

export function getQuoteById(index) {
    if (index >= 0 && index < quotes.length) {
        return quotes[index];
    }
    return quotes[0];
}

export function getAllQuotes() {
    return quotes;
}

export default {
    getRandomQuote,
    getQuoteById,
    getAllQuotes
};
