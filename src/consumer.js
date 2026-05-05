require('dotenv').config();
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const pool = require('./config/database');

const init = async () => {
    // 1. Konfigurasi RabbitMQ Connection
    const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
    const amqpUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${rabbitmqHost}:${process.env.RABBITMQ_PORT}`;
    
    let connection;
    try {
        connection = await amqp.connect(amqpUrl);
    } catch (error) {
        console.error('Consumer (RabbitMQ) Connection Error:', error);
        return;
    }

    const channel = await connection.createChannel();
    const queueName = 'notification:application';

    // Pastikan queue ada
    await channel.assertQueue(queueName, {
        durable: true,
    });

    console.log(`[*] Menunggu pesan di queue: ${queueName}. Tekan CTRL+C untuk keluar.`);

    // 2. Konfigurasi Nodemailer (Transporter)
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    // 3. Logic Consume & Kirim Email (Asynchronous)
    channel.consume(queueName, async (msg) => {
        if (message !== null) {
            try {
                // Parse payload yang isinya { application_id: '...' }
                const { application_id } = JSON.parse(msg.content.toString());
                console.log(`[x] Menerima event lamaran masuk. Application ID: ${application_id}`);

                // Query Database untuk mendapatkan: Email Perusahaan, Nama Pelamar, Email Pelamar, dan Waktu Daftar.
                // Asumsi: 
                // - Tabel applications terkait dengan tabel users (pelamar) via user_id
                // - Tabel applications terkait dengan tabel jobs via job_id
                // - Tabel jobs terkait dengan tabel companies via company_id (atau jika job ownernya user ber-role company, sesuaikan dengan skema Anda)
                // - Kriteria meminta mengirim email ke pemilik / job owner!
                
                // --- PERHATIAN MENGGENAI QUERY BAWAH INI ---
                // Sesuaikan 'jobs.created_by' atau 'jobs.company_id' tergantung bagaimana Anda menyimpan id pembuat lowongan di tabel jobs.
                const query = {
                    text: `
                        SELECT 
                            a.id as application_id, 
                            a.created_at,
                            u_pelamar.name as pelamar_name, 
                            u_pelamar.email as pelamar_email,
                            j.title as job_title,
                            u_owner.email as owner_email
                        FROM applications a
                        JOIN users u_pelamar ON a.user_id = u_pelamar.id
                        JOIN jobs j ON a.job_id = j.id
                        JOIN users u_owner ON j.created_by = u_owner.id
                        WHERE a.id = $1
                    `,
                    values: [application_id],
                };

                const result = await pool.query(query);

                if (result.rows.length > 0) {
                    const data = result.rows[0];

                    // Kriteria Advanced: Terdapat informasi nama pelamar, email pelamar, tanggal lamaran.
                    const mailOptions = {
                        from: '"OpenJob Team" <no-reply@openjob.com>',
                        to: data.owner_email, // Email dikirim KEPADA Job Owner (Perusahaan)
                        subject: `Notifikasi: Ada Lamaran Baru untuk Pekerjaan "${data.job_title}"`,
                        text: `
                            Halo!
                            
                            Seseorang baru saja melamar ke lowongan pekerjaan Anda (${data.job_title}).
                            
                            Berikut adalah rincian pelamar:
                            - Nama: ${data.pelamar_name}
                            - Email: ${data.pelamar_email}
                            - Tanggal Melamar: ${data.created_at}
                            
                            Silakan masuk ke dashboard OpenJob untuk melihat berkas lamarannya secara lengkap.
                            
                            Terima kasih,
                            OpenJob Team
                        `,
                    };

                    // Kirim Email via Nodemailer
                    const info = await transporter.sendMail(mailOptions);
                    console.log(`[v] Email berhasil dikirim ke ${data.owner_email}. Message ID: ${info.messageId}`);
                } else {
                    console.log(`[-] Lamaran dengan ID ${application_id} tidak ditemukan di database.`);
                }

                // Beritahu queue bahwa pesan telah sukses diproses
                channel.ack(msg);
            } catch (error) {
                console.error(`[!] Gagal memproses pesan:`, error);
                
                // Jika ingin message diolah ulang (kembali ke queue), gunakan nack(msg, false, true). 
                // Untuk tahap ini, menolak (discard) saja dengan nack(msg, false, false) sudah cukup baik.
                channel.nack(msg, false, false); 
            }
        }
    }, {
        noAck: false, // Penting! Memastikan pesan hilang dari queue HANYA jika dipanggil channel.ack()
    });
};

init();