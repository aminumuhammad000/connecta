import PDFDocument from 'pdfkit';
import path from 'path';

/**
 * Service to generate a PDF resume from profile data
 */
class PDFGenerationService {

    /**
     * Generates a PDF buffer from profile data
     * @param profile The profile data (populated with user, etc.)
     * @returns Promise<Buffer>
     */
    async generateResumePDF(profile: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 0, size: 'A4', bufferPages: true }); // Zero margin for full bleed header
                const buffers: Buffer[] = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));

                // --- DESIGN CONSTANTS ---
                const colors = {
                    primary: '#FD6730',   // Connecta Orange
                    secondary: '#FF8F6B', // Lighter Orange
                    accent: '#7C3AED',    // Premium Violet
                    text: '#111827',
                    subtext: '#6B7280',
                    lightBg: '#FFF7ED',   // Very light orange wash
                    white: '#FFFFFF',
                    border: '#E5E7EB'
                };

                const margins = { top: 60, left: 50, right: 50, bottom: 50 };

                // --- HEADER SECTION ---
                // Background Bar
                doc.rect(0, 0, 595.28, 140) // A4 width
                    .fill(colors.lightBg);

                // LOGO (Real Image) - Top Left
                const logoPath = path.join(process.cwd(), 'assets', 'logo.png');
                doc.image(logoPath, 50, 35, { width: 100 });

                // VERIFIED BADGE (Vector Draw) - Top Right
                doc.save();
                doc.translate(480, 40);
                // Badge Circle
                doc.circle(20, 20, 20).fill('#10B981'); // Success Green
                // Checkmark
                doc.lineWidth(3).strokeColor(colors.white)
                    .moveTo(10, 20).lineTo(18, 28).lineTo(30, 14).stroke();
                // Label
                doc.font('Helvetica-Bold').fontSize(10).fillColor('#10B981')
                    .text('VERIFIED', -5, 45, { align: 'center', width: 50 });
                doc.restore();

                // CANDIDATE NAME & INFO
                const user = profile.user || {};
                const name = `${user.firstName || profile.firstName || ''} ${user.lastName || profile.lastName || ''}`.trim().toUpperCase() || 'CONNECTA USER';

                doc.font('Helvetica-Bold').fontSize(28).fillColor(colors.text)
                    .text(name, margins.left, 80);

                doc.font('Helvetica-Oblique').fontSize(14).fillColor(colors.primary)
                    .text(profile.jobTitle || 'Freelancer', margins.left, 115);

                // Contact Row (Phone | Email | Location)
                doc.fontSize(9).fillColor(colors.subtext);
                const contactParts = [
                    user.email,
                    profile.phoneNumber || profile.phone,
                    profile.location
                ].filter(Boolean);

                const contactString = contactParts.join('  •  ');
                doc.text(contactString, margins.left, 145);

                // --- CONTENT BODY ---
                let yPos = 180;

                // 1. BIO / SUMMARY
                if (profile.bio) {
                    doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.text).text('PROFESSIONAL SUMMARY', margins.left, yPos);
                    yPos += 20;
                    doc.rect(margins.left, yPos, 2, profile.bio.length / 2 + 10).fill(colors.primary); // Accent Line
                    doc.font('Helvetica').fontSize(10).fillColor(colors.subtext)
                        .text(profile.bio, margins.left + 15, yPos, { width: 480, lineGap: 4 });
                    yPos = doc.y + 30;
                }

                // 2. SKILLS (Pills)
                if (profile.skills && profile.skills.length > 0) {
                    doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.text).text('SKILLS', margins.left, yPos);
                    yPos += 20;

                    const skillXStart = margins.left;
                    let currentX = skillXStart;
                    const pillHeight = 20;
                    const pillPadding = 10;

                    profile.skills.forEach((skill: string) => {
                        const width = doc.widthOfString(skill) + (pillPadding * 2);
                        if (currentX + width > 480) { // Wrap line
                            currentX = skillXStart;
                            yPos += 30;
                        }

                        // Draw Pill
                        doc.roundedRect(currentX, yPos, width, pillHeight, 10)
                            .fillAndStroke(colors.lightBg, colors.secondary);

                        doc.fillColor(colors.primary)
                            .fontSize(9)
                            .text(skill, currentX + pillPadding, yPos + 5);

                        currentX += width + 10;
                    });
                    yPos += 40;
                }

                // Helper for Timeline Sections
                const drawTimelineSection = (title: string, items: any[], isWork: boolean) => {
                    if (!items || items.length === 0) return;

                    // Check logic for page break
                    if (yPos > 700) { doc.addPage(); yPos = 50; }

                    doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.text).text(title, margins.left, yPos);
                    yPos += 25;

                    items.forEach((item: any) => {
                        if (yPos > 750) { doc.addPage(); yPos = 50; }

                        // Timeline Dot & Line
                        doc.circle(margins.left + 6, yPos + 6, 4).fill(colors.primary);
                        doc.rect(margins.left + 5, yPos + 6, 2, 40).fill(colors.lightBg); // Line down

                        // Content
                        const mainTitle = isWork ? item.position || item.title : `${item.degree} in ${item.fieldOfStudy}`;
                        const subTitle = isWork ? item.company : item.institution;

                        // Parse date safely
                        const getYear = (d: any) => {
                            if (!d || d === 'Present') return 'Present';
                            try {
                                const date = new Date(d);
                                return isNaN(date.getTime()) ? 'Present' : date.getFullYear();
                            } catch { return 'Present'; }
                        };
                        const dateStr = `${getYear(item.startDate)} - ${getYear(item.endDate)}`;

                        doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.text)
                            .text(mainTitle || 'Start', margins.left + 25, yPos);

                        doc.font('Helvetica').fontSize(10).fillColor(colors.text)
                            .text(subTitle || 'Unknown', margins.left + 25, yPos + 15);

                        // Date aligned right
                        doc.font('Helvetica-Bold').fontSize(9).fillColor(colors.primary)
                            .text(dateStr, 450, yPos, { align: 'right' });

                        if (item.description) {
                            doc.font('Helvetica').fontSize(9).fillColor(colors.subtext)
                                .text(item.description, margins.left + 25, yPos + 30, { width: 400 });
                            yPos += doc.heightOfString(item.description, { width: 400 }) + 10;
                        }

                        yPos += 45;
                    });
                    yPos += 20;
                };

                drawTimelineSection('WORK EXPERIENCE', profile.employment, true);
                drawTimelineSection('EDUCATION', profile.education, false);

                // --- FOOTER ---
                const drawFooter = (pageNumber: number) => {
                    const bottomY = 780; // A4 height is ~841
                    doc.moveTo(50, bottomY - 10).lineTo(545, bottomY - 10).strokeColor(colors.border || '#E5E7EB').stroke();
                    doc.font('Helvetica').fontSize(8).fillColor(colors.subtext)
                        .text('Connecta Verified Resume  •  Generated by Connecta AI', 50, bottomY, { align: 'center' });
                };

                // Apply footer to all pages
                const range = doc.bufferedPageRange(); // { start: 0, count: X }
                for (let i = 0; i < range.count; i++) {
                    doc.switchToPage(i);
                    drawFooter(i + 1);
                }

                doc.end();

            } catch (error) {
                console.error('PDF Generation Error:', error);
                reject(error);
            }
        });
    }
}

export default new PDFGenerationService();
