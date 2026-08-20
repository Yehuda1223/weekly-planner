import tls from 'tls';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  fromEmail?: string;
}

/**
 * Native Node.js TLS SMTP Client for Gmail & Standard SMTP Servers.
 * Connects securely to smtp.gmail.com:465 without any external npm packages.
 */
export async function sendEmailViaSMTP(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || 'yapexweb.service@gmail.com';
  const pass = process.env.SMTP_PASS || 'kayoutmfhygltccs';
  const fromName = options.fromName || process.env.SMTP_FROM_NAME || 'מתכנן שבועי';
  const fromEmail = options.fromEmail || process.env.SMTP_FROM_EMAIL || user;

  return new Promise((resolve) => {
    try {
      const socket = tls.connect(
        {
          host,
          port,
          rejectUnauthorized: false
        },
        () => {
          // Connected securely over TLS
        }
      );

      let step = 0;
      let responseBuffer = '';

      const sendCommand = (cmd: string) => {
        socket.write(cmd + '\r\n');
      };

      socket.on('data', (data) => {
        responseBuffer += data.toString();
        const lines = responseBuffer.split('\r\n');
        const lastLine = lines[lines.length - 2] || lines[lines.length - 1];

        // Check if server is still sending multiline response (e.g., 250-...)
        if (lastLine && /^\d{3}-/.test(lastLine)) {
          return;
        }

        const statusCode = parseInt(lastLine.substring(0, 3), 10);

        if (step === 0 && statusCode === 220) {
          // Greeting received
          step++;
          sendCommand('EHLO localhost');
        } else if (step === 1 && statusCode === 250) {
          // EHLO accepted
          step++;
          sendCommand('AUTH LOGIN');
        } else if (step === 2 && statusCode === 334) {
          // Username prompt
          step++;
          sendCommand(Buffer.from(user).toString('base64'));
        } else if (step === 3 && statusCode === 334) {
          // Password prompt
          step++;
          sendCommand(Buffer.from(pass).toString('base64'));
        } else if (step === 4 && statusCode === 235) {
          // Authentication successful
          step++;
          sendCommand(`MAIL FROM:<${fromEmail}>`);
        } else if (step === 5 && statusCode === 250) {
          // MAIL FROM accepted
          step++;
          sendCommand(`RCPT TO:<${options.to}>`);
        } else if (step === 6 && statusCode === 250) {
          // RCPT TO accepted
          step++;
          sendCommand('DATA');
        } else if (step === 7 && statusCode === 354) {
          // DATA accepted, send headers and body
          step++;
          const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@${host}>`;
          
          // Encode subject in UTF-8 Base64 RFC 2047
          const encodedSubject = `=?UTF-8?B?${Buffer.from(options.subject).toString('base64')}?=`;
          const encodedFromName = `=?UTF-8?B?${Buffer.from(fromName).toString('base64')}?=`;

          const emailHeaders = [
            `From: ${encodedFromName} <${fromEmail}>`,
            `To: <${options.to}>`,
            `Subject: ${encodedSubject}`,
            `Message-ID: ${messageId}`,
            `Date: ${new Date().toUTCString()}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
            '',
            Buffer.from(options.html, 'utf-8').toString('base64'),
            '.'
          ].join('\r\n');

          socket.write(emailHeaders + '\r\n');
        } else if (step === 8 && statusCode === 250) {
          // Message queued/sent successfully!
          step++;
          sendCommand('QUIT');
          socket.end();
          resolve({ success: true, messageId: `msg_${Date.now()}` });
        } else if (statusCode >= 400) {
          // Error response
          console.error(`SMTP Error at step ${step}: ${lastLine}`);
          socket.end();
          resolve({ success: false, error: lastLine });
        }
      });

      socket.on('error', (err) => {
        console.error('SMTP Socket Error:', err);
        resolve({ success: false, error: err.message });
      });

      socket.setTimeout(15000, () => {
        socket.end();
        resolve({ success: false, error: 'SMTP Connection timeout (15s)' });
      });
    } catch (e: any) {
      console.error('SMTP Exception:', e);
      resolve({ success: false, error: e?.message || 'SMTP Exception' });
    }
  });
}
