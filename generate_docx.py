import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Mm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def create_internship_report_document(output_filename="Appendix_5_Internship_Report_Format.docx"):
    doc = Document()

    # Define base styles
    styles = doc.styles
    normal_style = styles['Normal']
    normal_font = normal_style.font
    normal_font.name = 'Times New Roman'
    normal_font.size = Pt(12)
    normal_font.color.rgb = RGBColor(0, 0, 0)
    normal_style.paragraph_format.line_spacing = 1.5
    normal_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    normal_style.paragraph_format.space_after = Pt(6)

    # Configure Heading 1 (Chapter Headings: 16pt, Bold, Times New Roman, Black)
    h1_style = styles['Heading 1']
    h1_font = h1_style.font
    h1_font.name = 'Times New Roman'
    h1_font.size = Pt(16)
    h1_font.bold = True
    h1_font.color.rgb = RGBColor(0, 0, 0)
    h1_style.paragraph_format.line_spacing = 1.5
    h1_style.paragraph_format.space_before = Pt(12)
    h1_style.paragraph_format.space_after = Pt(6)
    h1_style.paragraph_format.keep_with_next = True

    # Configure Heading 2 (Section Headings: 14pt, Bold, Times New Roman, Black)
    h2_style = styles['Heading 2']
    h2_font = h2_style.font
    h2_font.name = 'Times New Roman'
    h2_font.size = Pt(14)
    h2_font.bold = True
    h2_font.color.rgb = RGBColor(0, 0, 0)
    h2_style.paragraph_format.line_spacing = 1.5
    h2_style.paragraph_format.space_before = Pt(10)
    h2_style.paragraph_format.space_after = Pt(4)
    h2_style.paragraph_format.keep_with_next = True

    # Configure Heading 3 (Sub-section Headings: 12pt, Bold, Times New Roman, Black)
    h3_style = styles['Heading 3']
    h3_font = h3_style.font
    h3_font.name = 'Times New Roman'
    h3_font.size = Pt(12)
    h3_font.bold = True
    h3_font.color.rgb = RGBColor(0, 0, 0)
    h3_style.paragraph_format.line_spacing = 1.5
    h3_style.paragraph_format.space_before = Pt(8)
    h3_style.paragraph_format.space_after = Pt(2)
    h3_style.paragraph_format.keep_with_next = True

    # Helper function for setting section margins
    def apply_standard_margins(sec):
        sec.top_margin = Inches(1.0)
        sec.bottom_margin = Inches(1.0)
        sec.left_margin = Inches(1.25)
        sec.right_margin = Inches(1.0)
        sec.page_width = Mm(210)  # A4
        sec.page_height = Mm(297) # A4

    # Helper function to add centered footer page numbers
    def add_page_number(paragraph):
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = paragraph.add_run()
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        fldChar1 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
        instrText = parse_xml(r'<w:instrText %s xml:space="preserve"> PAGE </w:instrText>' % nsdecls('w'))
        fldChar2 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
        fldChar3 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
        run._r.append(fldChar1)
        run._r.append(instrText)
        run._r.append(fldChar2)
        run._r.append(fldChar3)

    # Helper function to format table cell padding and borders
    def style_table(table, header_bg="F2F2F2"):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        tblPr = table._tbl.tblPr
        tblBorders = parse_xml(r'''
            <w:tblBorders %s>
                <w:top w:val="single" w:sz="6" w:space="0" w:color="333333"/>
                <w:bottom w:val="single" w:sz="6" w:space="0" w:color="333333"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
                <w:insideV w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
                <w:left w:val="single" w:sz="6" w:space="0" w:color="333333"/>
                <w:right w:val="single" w:sz="6" w:space="0" w:color="333333"/>
            </w:tblBorders>
        ''' % nsdecls('w'))
        tblPr.append(tblBorders)

        for i, row in enumerate(table.rows):
            trPr = row._tr.get_or_add_trPr()
            trPr.append(parse_xml(r'<w:cantSplit %s/>' % nsdecls('w')))
            if i == 0:
                trPr.append(parse_xml(r'<w:tblHeader %s/>' % nsdecls('w')))
            for cell in row.cells:
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                tcPr = cell._tc.get_or_add_tcPr()
                # cell padding
                tcMar = parse_xml(r'''
                    <w:tcMar %s>
                        <w:top w:w="120" w:type="dxa"/>
                        <w:bottom w:w="120" w:type="dxa"/>
                        <w:left w:w="160" w:type="dxa"/>
                        <w:right w:w="160" w:type="dxa"/>
                    </w:tcMar>
                ''' % nsdecls('w'))
                tcPr.append(tcMar)
                if i == 0 and header_bg:
                    shd = parse_xml(r'<w:shd %s w:fill="%s"/>' % (nsdecls('w'), header_bg))
                    tcPr.append(shd)

    # -------------------------------------------------------------
    # SECTION 1: COVER PAGE & PRELIMINARY PAGES (Roman Numbering i, ii, ...)
    # -------------------------------------------------------------
    sec_prelim = doc.sections[0]
    apply_standard_margins(sec_prelim)
    
    # Configure Roman page numbers starting at i
    sectPr_prelim = sec_prelim._sectPr
    pgNumType_prelim = parse_xml(r'<w:pgNum %s w:fmt="lowerRoman" w:start="1"/>' % nsdecls('w'))
    sectPr_prelim.append(pgNumType_prelim)
    
    # Preliminary Footer
    footer_prelim = sec_prelim.footer
    add_page_number(footer_prelim.paragraphs[0])

    # -------------------------------------------------------------
    # PART 0: GUIDELINES & SPECIFICATION OVERVIEW (Appendix-5 Document Summary)
    # -------------------------------------------------------------
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("APPENDIX-5\nSAMPLE INTERNSHIP REPORT CONTENTS AND REPORT FORMAT")
    r.font.size = Pt(16)
    r.font.bold = True

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("Pokhara University — Faculty of Science & Technology")
    r_sub.font.size = Pt(12)
    r_sub.font.italic = True

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Section 1 Guidelines summary
    h = doc.add_heading("1. Prescribed Content Flow for Internship Proposal / Activities", level=2)
    guidelines_flow1 = [
        "1. Introduction",
        "2. Objectives",
        "3. Description of Internship Work",
        "4. Internship Plan",
        "5. Expected Outcome of Internship Activities",
        "6. References"
    ]
    for g in guidelines_flow1:
        p = doc.add_paragraph(g)
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.space_after = Pt(2)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    h = doc.add_heading("2. Prescribed Content Flow for Final Internship Report", level=2)
    guidelines_flow2 = [
        "1. Cover & Title Page",
        "2. Certificate Page (Supervisor Recommendation, Focal Person Recommendation, External Examiners Approval)",
        "3. Acknowledgement",
        "4. Abstract Page",
        "5. Table of Contents",
        "6. List of Abbreviations, List of Figures, List of Tables",
        "7. Main Report (Chapters 1 to 4)",
        "8. References (APA Referencing Standard)",
        "9. Bibliography (studied non-cited sources)",
        "10. Appendices (Screenshots, Source Code, Work Logs)"
    ]
    for g in guidelines_flow2:
        p = doc.add_paragraph(g)
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.space_after = Pt(2)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    h = doc.add_heading("3. Prescribed Chapter Structure & Formatting Standards Table", level=2)
    
    # Table of Standards
    table_std = doc.add_table(rows=7, cols=2)
    style_table(table_std)
    std_data = [
        ("Parameter", "Specification / Format Standard"),
        ("Page Size & Margins", "A4 Size. Top = 1\", Bottom = 1\", Right = 1\", Left = 1.25\""),
        ("Paragraph Style & Font", "Times New Roman, 12 pt, Justified alignment, 1.5 line spacing"),
        ("Section Headings", "Chapter Headings = 16 pt Bold | Section (X.Y) = 14 pt Bold | Sub-section (X.Y.Z) = 12 pt Bold"),
        ("Figures & Tables", "Center aligned. Figure caption: centered BELOW figure. Table caption: centered ABOVE table. Bold 12 pt"),
        ("Page Numbering", "Preliminary pages (Certificate to Lists): Lowercase Roman (i, ii, iii...). Bottom center.\nMain Report (Chapter 1 onwards): Numeric (1, 2, 3...). Bottom center."),
        ("Binding & Submission", "No. of Copies: 3 (College Library + Self + PU Office of Controller of Examinations)\nBinding: Golden Embracing with Black Binding")
    ]
    for row_idx, (c1, c2) in enumerate(std_data):
        row = table_std.rows[row_idx]
        p0 = row.cells[0].paragraphs[0]
        p1 = row.cells[1].paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p1.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r0 = p0.add_run(c1)
        r1 = p1.add_run(c2)
        if row_idx == 0:
            r0.font.bold = True
            r1.font.bold = True

    doc.add_page_break()

    # -------------------------------------------------------------
    # SAMPLE INTERNSHIP REPORT TEMPLATE - COVER PAGE
    # -------------------------------------------------------------
    p_cov = doc.add_paragraph()
    p_cov.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_cov.add_run("A FINAL INTERNSHIP REPORT ON\n")
    r.font.size = Pt(14)
    r.font.bold = True

    r_title = p_cov.add_run("[TITLE OF THE INTERNSHIP PROJECT / DOMAIN WORK]\n\n")
    r_title.font.size = Pt(18)
    r_title.font.bold = True

    p_org = doc.add_paragraph()
    p_org.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_org.add_run("Carried out at:\n")
    r.font.italic = True
    r2 = p_org.add_run("[NAME OF THE HOST ORGANIZATION]\n[Organization Address, City, Country]\n\n")
    r2.font.bold = True

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.add_run("Submitted by:\n").font.italic = True
    r_name = p_sub.add_run("[STUDENT FULL NAME]\n")
    r_name.font.bold = True
    p_sub.add_run("PU Roll No.: [XXXXXX] | Exam Roll No.: [XXXXXX]\nPU Registration No.: [XXX-X-X-XXXXX-XXXX]\n\n")

    p_to = doc.add_paragraph()
    p_to.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_to.add_run("Submitted to:\n").font.italic = True
    r_dept = p_to.add_run("Department of Computer Science / Information Technology\nFaculty of Science and Technology\nPOKHARA UNIVERSITY\n[College / Campus Name, Address]\n\n")
    r_dept.font.bold = True

    p_date = doc.add_paragraph()
    p_date.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_date.add_run("In partial fulfillment of the requirements for the degree of\nBachelor of Computer Engineering / Software Engineering / IT\n\n[Month, Year]")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CERTIFICATE PAGES
    # -------------------------------------------------------------
    # i. Supervisor Recommendation Certificate
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("SUPERVISOR'S RECOMMENDATION CERTIFICATE\n")
    r.font.size = Pt(16)
    r.font.bold = True

    doc.add_paragraph(
        "This is to certify that the internship report entitled \"[Title of Internship Report]\" "
        "submitted by [Student Full Name] (PU Roll No: [XXXXXX], Registration No: [XXX-X-X-XXXXX-XXXX]) "
        "in partial fulfillment of the requirements for the degree of Bachelor of Computer / Software Engineering / IT "
        "has been completed under my supervision and guidance.\n\n"
        "To the best of my knowledge, this report represents authentic work carried out during the internship period "
        "from [Start Date] to [End Date] at [Host Organization Name]. I recommend this report for evaluation."
    )

    doc.add_paragraph().paragraph_format.space_after = Pt(36)

    # Signature block table
    t_sig1 = doc.add_table(rows=2, cols=2)
    style_table(t_sig1, header_bg=None)
    t_sig1.rows[0].cells[0].paragraphs[0].add_run("_______________________________\n[Supervisor Name]\nAcademic Supervisor\nDepartment of Computer Science/IT\n[College Name]")
    t_sig1.rows[0].cells[1].paragraphs[0].add_run("_______________________________\n[Head of Department Name]\nHead of Department\nDepartment of Computer Science/IT\n[College Name]")
    t_sig1.rows[1].cells[0].paragraphs[0].add_run("Date: ______________")
    t_sig1.rows[1].cells[1].paragraphs[0].add_run("Date: ______________")

    doc.add_page_break()

    # ii. Focal Person Recommendation Certificate
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("FOCAL PERSON'S RECOMMENDATION CERTIFICATE\n")
    r.font.size = Pt(16)
    r.font.bold = True

    doc.add_paragraph(
        "This is to certify that Mr./Ms. [Student Full Name] has successfully completed an internship program "
        "at [Host Organization Name] from [Start Date] to [End Date]. During this period, the intern was assigned "
        "to the [Department/Unit Name] department and actively worked on [Project / Technical Domain Name].\n\n"
        "The intern has displayed commendable technical competence, professionalism, and dedication. "
        "The internship report submitted herewith accurately reflects the technical activities and contributions "
        "rendered at our organization."
    )

    doc.add_paragraph().paragraph_format.space_after = Pt(36)

    t_sig2 = doc.add_table(rows=2, cols=2)
    style_table(t_sig2, header_bg=None)
    t_sig2.rows[0].cells[0].paragraphs[0].add_run("_______________________________\n[Focal Person / Mentor Name]\nDesignation: [Senior Engineer / Lead]\n[Host Organization Name]")
    t_sig2.rows[0].cells[1].paragraphs[0].add_run("_______________________________\n[HR / Manager Name]\nHuman Resources Department\n[Host Organization Name]")
    t_sig2.rows[1].cells[0].paragraphs[0].add_run("Date: ______________\nOfficial Seal:")
    t_sig2.rows[1].cells[1].paragraphs[0].add_run("Date: ______________\nOfficial Seal:")

    doc.add_page_break()

    # iii. External Examiners Approval Certificate
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("EXTERNAL EXAMINERS' APPROVAL CERTIFICATE\n")
    r.font.size = Pt(16)
    r.font.bold = True

    doc.add_paragraph(
        "The internship report entitled \"[Title of Internship Report]\" prepared and submitted by [Student Full Name] "
        "(PU Roll No: [XXXXXX]) has been examined and evaluated by the undersigned board of examiners and is approved "
        "in partial fulfillment of the requirements for the award of the degree of Bachelor of Computer / Software Engineering / IT "
        "under the Faculty of Science and Technology, Pokhara University."
    )

    doc.add_paragraph().paragraph_format.space_after = Pt(36)

    t_sig3 = doc.add_table(rows=3, cols=2)
    style_table(t_sig3, header_bg=None)
    t_sig3.rows[0].cells[0].paragraphs[0].add_run("_______________________________\nInternal Examiner\nName: _______________________\nDesignation: _________________")
    t_sig3.rows[0].cells[1].paragraphs[0].add_run("_______________________________\nExternal Examiner\nName: _______________________\nDesignation: _________________")
    t_sig3.rows[1].cells[0].paragraphs[0].add_run("_______________________________\nAcademic Supervisor\nName: _______________________")
    t_sig3.rows[1].cells[1].paragraphs[0].add_run("_______________________________\nHead of Department\nName: _______________________")
    t_sig3.rows[2].cells[0].paragraphs[0].add_run("Date: ______________")
    t_sig3.rows[2].cells[1].paragraphs[0].add_run("Official Seal of Institution:")

    doc.add_page_break()

    # -------------------------------------------------------------
    # ACKNOWLEDGEMENT
    # -------------------------------------------------------------
    h = doc.add_heading("ACKNOWLEDGEMENT", level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph(
        "I would like to express my sincere gratitude and appreciation to Pokhara University and [College Name] "
        "for providing me with the opportunity to undertake this practical internship program as part of my curriculum. "
        "This experience has proven to be an essential stepping stone in bridging academic theoretical knowledge with industry practice."
    )
    doc.add_paragraph(
        "I express my deep sense of gratitude to my academic supervisor, [Supervisor Name], and Head of Department, "
        "[HOD Name], for their continuous guidance, invaluable suggestions, and encouragement throughout the internship period."
    )
    doc.add_paragraph(
        "I am profoundly thankful to [Host Organization Name] for hosting me as an intern. I extend my sincere thanks to my industry mentor / focal person, "
        "[Focal Person Name], and team members of the [Department Name] division for their immense support, mentorship, and willingness to share professional expertise."
    )
    doc.add_paragraph(
        "Finally, I extend my heartfelt thanks to my parents, family, and peers for their constant encouragement and support throughout this journey."
    )

    doc.add_paragraph("\n[Student Full Name]\nPU Roll No: [XXXXXX]")

    doc.add_page_break()

    # -------------------------------------------------------------
    # ABSTRACT
    # -------------------------------------------------------------
    h = doc.add_heading("ABSTRACT", level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph(
        "This internship report encapsulates the technical activities, project developments, professional workflows, and learning outcomes "
        "gained during a [X-week / X-month] industrial internship carried out at [Host Organization Name] in the [Department/Unit Name] department. "
        "The primary focus of the internship involved [briefly state core project/domain, e.g., Full Stack Web Application Development, Cloud Infrastructure Maintenance, Machine Learning Pipeline Integration]."
    )
    doc.add_paragraph(
        "During the internship period, key responsibilities encompassed [list primary tasks: e.g., designing RESTful APIs, implementing responsive frontend user interfaces, writing automated unit tests, optimizing database queries, and participating in daily Scrum standups]. "
        "The technologies utilized throughout the internship include [list stack: e.g., React, Next.js, Node.js, Spring Boot, PostgreSQL, Docker, Git, and Jira]."
    )
    doc.add_paragraph(
        "Through hands-on involvement in production-level engineering workflows, this internship successfully contextualized academic concepts into real-world software development paradigms. "
        "Key learning outcomes achieved include improved code quality standards, enhanced problem-solving efficiency, experience with Agile engineering practices, and professional collaborative communication."
    )
    doc.add_paragraph("\nKeywords: [Keyword 1, Keyword 2, Keyword 3, Keyword 4, Keyword 5]")

    doc.add_page_break()

    # -------------------------------------------------------------
    # TABLE OF CONTENTS / LISTS PLACEHOLDERS
    # -------------------------------------------------------------
    h = doc.add_heading("TABLE OF CONTENTS", level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph("[Automated Table of Contents Field — Word will populate headers upon update]\n")
    
    # Manual styled TOC overview matching prescribed flow
    toc_items = [
        ("Supervisor Recommendation Certificate", "i"),
        ("Focal Person Recommendation Certificate", "ii"),
        ("External Examiners Approval Certificate", "iii"),
        ("Acknowledgement", "iv"),
        ("Abstract", "v"),
        ("List of Abbreviations", "vi"),
        ("List of Figures", "vii"),
        ("List of Tables", "viii"),
        ("CHAPTER 1: INTRODUCTION", "1"),
        ("    1.1 Introduction", "1"),
        ("    1.2 Background of the Works", "2"),
        ("    1.3 Objectives", "3"),
        ("    1.4 Scope and Limitation", "4"),
        ("    1.5 Report Organization", "5"),
        ("CHAPTER 2: ORGANIZATION DETAILS AND LITERATURE REVIEW", "6"),
        ("    2.1 Introduction to Organization", "6"),
        ("    2.2 Organizational Hierarchy", "7"),
        ("    2.3 Working Domains of Organization", "8"),
        ("    2.4 Description of Intern Department/Unit", "9"),
        ("    2.5 Literature Review / Related Study", "10"),
        ("CHAPTER 3: INTERNSHIP ACTIVITIES", "11"),
        ("    3.1 Roles and Responsibilities", "11"),
        ("    3.2 Weekly Log", "12"),
        ("    3.3 Description of the Project(s) Involved During Internship", "14"),
        ("    3.4 Tasks / Activities Performed", "16"),
        ("CHAPTER 4: CONCLUSION AND LEARNING OUTCOMES", "20"),
        ("    4.1 Conclusion", "20"),
        ("    4.2 Learning Outcome", "21"),
        ("REFERENCES", "23"),
        ("BIBLIOGRAPHY", "25"),
        ("APPENDICES", "26")
    ]
    t_toc = doc.add_table(rows=len(toc_items)+1, cols=2)
    style_table(t_toc, header_bg="EAEAEA")
    t_toc.rows[0].cells[0].paragraphs[0].add_run("Section / Chapter Title").font.bold = True
    t_toc.rows[0].cells[1].paragraphs[0].add_run("Page No.").font.bold = True
    for idx, (title, page) in enumerate(toc_items):
        r_cells = t_toc.rows[idx+1].cells
        p0 = r_cells[0].paragraphs[0]
        p1 = r_cells[1].paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_t = p0.add_run(title)
        if "CHAPTER" in title or title in ["REFERENCES", "BIBLIOGRAPHY", "APPENDICES"]:
            r_t.font.bold = True
        p1.add_run(page)

    doc.add_page_break()

    # LIST OF ABBREVIATIONS
    h = doc.add_heading("LIST OF ABBREVIATIONS", level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER

    abbrev_data = [
        ("Abbreviation", "Expanded Term"),
        ("API", "Application Programming Interface"),
        ("APA", "American Psychological Association"),
        ("CI/CD", "Continuous Integration / Continuous Deployment"),
        ("DB", "Database"),
        ("HTTP", "Hypertext Transfer Protocol"),
        ("IT", "Information Technology"),
        ("PU", "Pokhara University"),
        ("REST", "Representational State Transfer"),
        ("UI / UX", "User Interface / User Experience"),
        ("URL", "Uniform Resource Locator")
    ]
    t_abbr = doc.add_table(rows=len(abbrev_data), cols=2)
    style_table(t_abbr)
    for idx, (a, b) in enumerate(abbrev_data):
        row = t_abbr.rows[idx]
        row.cells[0].paragraphs[0].add_run(a).font.bold = (idx == 0)
        row.cells[1].paragraphs[0].add_run(b).font.bold = (idx == 0)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # LIST OF FIGURES
    h = doc.add_heading("LIST OF FIGURES", level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER

    fig_items = [
        ("Figure No.", "Caption Title", "Page"),
        ("Figure 2.1", "Organizational Hierarchy Structure of Host Company", "7"),
        ("Figure 3.1", "System Architecture Diagram of the Internship Project", "15"),
        ("Figure 3.2", "Entity Relationship Diagram (ERD) of Database Module", "17"),
        ("Figure A.1", "User Dashboard Interface Screenshot", "26")
    ]
    t_fig = doc.add_table(rows=len(fig_items), cols=3)
    style_table(t_fig)
    for idx, (f, c, p_num) in enumerate(fig_items):
        row = t_fig.rows[idx]
        row.cells[0].paragraphs[0].add_run(f).font.bold = (idx == 0)
        row.cells[1].paragraphs[0].add_run(c).font.bold = (idx == 0)
        row.cells[2].paragraphs[0].add_run(p_num).font.bold = (idx == 0)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # LIST OF TABLES
    h = doc.add_heading("LIST OF TABLES", level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER

    tbl_items = [
        ("Table No.", "Caption Title", "Page"),
        ("Table 1.1", "Report Organization Structure Summary", "5"),
        ("Table 3.1", "Weekly Technical Activity Log Summary", "12"),
        ("Table 3.2", "API Endpoint Specifications and Response Codes", "18")
    ]
    t_tbl = doc.add_table(rows=len(tbl_items), cols=3)
    style_table(t_tbl)
    for idx, (f, c, p_num) in enumerate(tbl_items):
        row = t_tbl.rows[idx]
        row.cells[0].paragraphs[0].add_run(f).font.bold = (idx == 0)
        row.cells[1].paragraphs[0].add_run(c).font.bold = (idx == 0)
        row.cells[2].paragraphs[0].add_run(p_num).font.bold = (idx == 0)

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 2: MAIN REPORT BODY (Numeric Page Numbering 1, 2, 3...)
    # -------------------------------------------------------------
    sec_main = doc.add_section()
    apply_standard_margins(sec_main)

    # Decimal numbering starting at 1
    sectPr_main = sec_main._sectPr
    pgNumType_main = parse_xml(r'<w:pgNum %s w:fmt="decimal" w:start="1"/>' % nsdecls('w'))
    sectPr_main.append(pgNumType_main)

    # Main Footer
    footer_main = sec_main.footer
    add_page_number(footer_main.paragraphs[0])

    # -------------------------------------------------------------
    # CHAPTER 1: INTRODUCTION
    # -------------------------------------------------------------
    h = doc.add_heading("CHAPTER 1: INTRODUCTION", level=1)

    h = doc.add_heading("1.1. Introduction", level=2)
    doc.add_paragraph(
        "This internship report documents the practical experience and engineering achievements accomplished during the "
        "[X-week / X-month] internship program at [Host Organization Name]. The internship forms an integral constituent "
        "of the Bachelor of Computer / Software Engineering / IT degree curriculum under Pokhara University. "
        "The primary purpose is to expose students to real-world industrial environments, professional software engineering practices, "
        "and collaborative team workflows."
    )

    h = doc.add_heading("1.2. Background of the Works", level=2)
    doc.add_paragraph(
        "In modern computer engineering, theoretical concepts gained in academic settings must be complemented by practical exposure. "
        "During this internship, the work was centered around [describe core background, e.g., modernized web application architectures, "
        "microservices communication, cloud native deployment pipelines, and UI/UX design integration]. The project was initiated "
        "to address specific operational requirements of the organization, providing scalable and efficient technical solutions."
    )

    h = doc.add_heading("1.3. Objectives", level=2)
    doc.add_paragraph(
        "The main objectives of undertaking this internship program are categorized into general academic goals and specific technical milestones:"
    )
    obj_points = [
        "To apply theoretical software engineering principles to real-world commercial software development.",
        "To gain hands-on proficiency in modern frontend/backend technologies, version control systems, and deployment workflows.",
        "To understand organizational hierarchies, corporate culture, and industry standard development procedures (Agile/Scrum).",
        "To design, develop, test, and document functional software modules assigned by the host organization mentor.",
        "To enhance interpersonal, problem-solving, time management, and technical documentation skills."
    ]
    for pt in obj_points:
        p = doc.add_paragraph(pt, style='List Bullet')
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.space_after = Pt(2)

    h = doc.add_heading("1.4. Scope and Limitation", level=2)
    doc.add_paragraph(
        "The scope of this internship encompasses the active design, coding, testing, and documentation of [assigned project module/system]. "
        "It includes writing maintainable source code, conducting integration testing, participating in code reviews, and resolving bug reports."
    )
    doc.add_paragraph(
        "However, certain limitations were present during the execution of internship tasks, including strict confidentiality agreements "
        "restricting full public disclosure of internal enterprise source code, restricted access to live production databases, "
        "and time constraints limiting the full deployment of non-essential secondary features."
    )

    h = doc.add_heading("1.5. Report Organization", level=2)
    doc.add_paragraph(
        "This internship report is organized into four main chapters followed by references and appendices, structured as follows:"
    )

    p_tbl_cap = doc.add_paragraph()
    p_tbl_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_cap = p_tbl_cap.add_run("Table 1.1: Report Organization Structure Summary")
    r_cap.font.bold = True

    t_rep_org = doc.add_table(rows=5, cols=2)
    style_table(t_rep_org)
    ro_data = [
        ("Chapter Title", "Summary of Contents"),
        ("Chapter 1: Introduction", "Introduces internship work, background, objectives, scope, limitations, and report structure."),
        ("Chapter 2: Organization Details & Literature Review", "Presents host company details, hierarchy, working domains, intern unit, and related study."),
        ("Chapter 3: Internship Activities", "Details roles, weekly logs, technical descriptions of projects involved, and tasks performed."),
        ("Chapter 4: Conclusion & Learning Outcomes", "Summarizes key conclusions and contextualizes academic learning outcomes achieved.")
    ]
    for idx, (c1, c2) in enumerate(ro_data):
        row = t_rep_org.rows[idx]
        row.cells[0].paragraphs[0].add_run(c1).font.bold = (idx == 0)
        row.cells[1].paragraphs[0].add_run(c2).font.bold = (idx == 0)

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 2: ORGANIZATION DETAILS AND LITERATURE REVIEW
    # -------------------------------------------------------------
    h = doc.add_heading("CHAPTER 2: ORGANIZATION DETAILS AND LITERATURE REVIEW", level=1)

    h = doc.add_heading("2.1. Introduction to Organization", level=2)
    doc.add_paragraph(
        "[Host Organization Name] is a leading [software development company / tech firm / IT consultancy] established in [Year]. "
        "The company specializes in delivering enterprise software solutions, web and mobile application development, cloud engineering, "
        "and digital transformation services to domestic and international clients."
    )

    h = doc.add_heading("2.2. Organizational Hierarchy", level=2)
    doc.add_paragraph(
        "The organization operates under a structured matrix hierarchy that fosters cross-functional collaboration while maintaining "
        "clear operational accountability across executive, managerial, and engineering divisions."
    )

    # Box layout representing Figure 2.1
    t_fig_box = doc.add_table(rows=1, cols=1)
    style_table(t_fig_box, header_bg="FAFAFA")
    p_fig_content = t_fig_box.rows[0].cells[0].paragraphs[0]
    p_fig_content.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_fig_content.add_run("\n[ Board of Directors / CEO ]\n│\n[ Chief Technology Officer (CTO) ] ─── [ HR & Admin ]\n│\n┌─────────────────────────┬─────────────────────────┐\n[ Software Engineering ]  [ Quality Assurance ]   [ DevOps & Infra ]\n│\n[ Intern Department / Unit ]\n").font.name = 'Courier New'

    p_fig_cap = doc.add_paragraph()
    p_fig_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_fcap = p_fig_cap.add_run("Figure 2.1: Organizational Hierarchy Structure of Host Company")
    r_fcap.font.bold = True

    h = doc.add_heading("2.3. Working Domains of Organization", level=2)
    doc.add_paragraph(
        "The core technical domains operated by [Host Organization Name] include:"
    )
    dom_points = [
        "Web & Enterprise Application Development (Full Stack solutions using React, Next.js, Node.js, Spring Boot).",
        "Mobile Application Development (Native iOS/Android and cross-platform Flutter/React Native applications).",
        "Cloud Engineering & Infrastructure Operations (AWS, Azure, Docker containerization, Kubernetes orchestration).",
        "Data Analytics & Machine Learning (Predictive modeling, automated business intelligence dashboards)."
    ]
    for pt in dom_points:
        p = doc.add_paragraph(pt, style='List Bullet')
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.space_after = Pt(2)

    h = doc.add_heading("2.4. Description of Intern Department/Unit", level=2)
    doc.add_paragraph(
        "During the internship tenure, the intern was placed in the [Department/Unit Name, e.g., Web Engineering Unit / Software R&D Division]. "
        "This unit is responsible for architecture design, API development, frontend component engineering, and code quality maintenance "
        "for primary software products of the organization."
    )

    h = doc.add_heading("2.5. Literature Review / Related Study (if any)", level=2)
    doc.add_paragraph(
        "Before commencing active development tasks, an extensive literature review and technological assessment were conducted. "
        "Key concepts studied included modern RESTful API architectural constraints (Fielding, 2000), state management patterns in single-page applications, "
        "database indexing strategies for query performance optimization, and CI/CD automated test workflows."
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 3: INTERNSHIP ACTIVITIES
    # -------------------------------------------------------------
    h = doc.add_heading("CHAPTER 3: INTERNSHIP ACTIVITIES", level=1)

    h = doc.add_heading("3.1. Roles and Responsibilities", level=2)
    doc.add_paragraph(
        "As a Software Engineering Intern, the primary roles and responsibilities assigned by the host organization mentor included:"
    )
    roles = [
        "Participating in daily Agile Scrum standups, sprint planning meetings, and technical refinement sessions.",
        "Developing responsive, accessible frontend component modules in accordance with UI/UX mockups.",
        "Building, testing, and integrating backend REST API endpoints with robust error handling.",
        "Writing clean, self-documented code adhering to the organization's coding standards and linting rules.",
        "Conducting peer code reviews and submitting Pull Requests (PRs) via Git repository management platforms."
    ]
    for r in roles:
        p = doc.add_paragraph(r, style='List Bullet')
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.space_after = Pt(2)

    h = doc.add_heading("3.2. Weekly Log", level=2)
    doc.add_paragraph(
        "The following weekly log summarizes the technical activities, tasks executed, and outcomes achieved during the internship period:"
    )

    p_tbl_cap = doc.add_paragraph()
    p_tbl_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_cap = p_tbl_cap.add_run("Table 3.1: Weekly Technical Activity Log Summary")
    r_cap.font.bold = True

    t_log = doc.add_table(rows=7, cols=4)
    style_table(t_log)
    log_headers = ["Week #", "Duration / Dates", "Technical Activities Performed", "Key Outcome / Output"]
    for c_idx, h_text in enumerate(log_headers):
        t_log.rows[0].cells[c_idx].paragraphs[0].add_run(h_text).font.bold = True

    log_rows = [
        ("Week 1", "Day 1 - Day 5", "Company orientation, workstation setup, Git repository access, development environment configuration, codebase walkthrough.", "Environment ready, repository cloned."),
        ("Week 2", "Day 6 - Day 10", "Studied project architecture, reviewed existing REST APIs, fixed minor UI alignment bugs in staging environment.", "First PR merged, bug fixes verified."),
        ("Week 3", "Day 11 - Day 15", "Designed responsive frontend components, integrated form validation libraries, handled API authentication tokens.", "User login/signup flow completed."),
        ("Week 4", "Day 16 - Day 20", "Developed backend controller endpoints, implemented database schema migrations, added query indexing.", "API endpoints deployed to test server."),
        ("Week 5", "Day 21 - Day 25", "Integrated automated unit testing (Jest/JUnit), performed bug fixes, refactored redundant code blocks.", "Test coverage increased to >80%."),
        ("Week 6", "Day 26 - Day 30", "Final system integration testing, performance optimization, user documentation preparation, final demonstration to team lead.", "Project successfully handed over.")
    ]
    for r_idx, r_data in enumerate(log_rows):
        row = t_log.rows[r_idx+1]
        for c_idx, text_val in enumerate(r_data):
            row.cells[c_idx].paragraphs[0].add_run(text_val)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    h = doc.add_heading("3.3. Description of the Project(s) Involved During Internship", level=2)
    doc.add_paragraph(
        "The intern actively contributed to the development of [Project Name], an enterprise web application designed for [describe purpose]. "
        "The project architecture utilizes a decoupled client-server model with a Next.js/React frontend communicating with a Spring Boot/Node.js backend "
        "via JSON-encoded RESTful APIs, backed by a PostgreSQL relational database."
    )

    h = doc.add_heading("3.4. Tasks / Activities Performed", level=2)
    doc.add_paragraph(
        "Detailed technical activities and engineering implementations executed during the internship include:"
    )
    tasks = [
        "Frontend Component Engineering: Built modular, reusable UI components using JavaScript/TypeScript, CSS modules, and modern state management tools.",
        "Backend API & Database Design: Implemented controller classes, service interfaces, data transfer objects (DTOs), and JPA repository queries.",
        "Security & Authentication: Configured JWT (JSON Web Token) middleware authentication and role-based access control (RBAC) guards.",
        "Testing & CI/CD: Wrote unit and integration test scripts, configured automated build pipelines to validate code quality prior to staging deployment."
    ]
    for t in tasks:
        p = doc.add_paragraph(t, style='List Bullet')
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.space_after = Pt(2)

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 4: CONCLUSION AND LEARNING OUTCOMES
    # -------------------------------------------------------------
    h = doc.add_heading("CHAPTER 4: CONCLUSION AND LEARNING OUTCOMES", level=1)

    h = doc.add_heading("4.1. Conclusion", level=2)
    doc.add_paragraph(
        "The [X-week / X-month] industrial internship program at [Host Organization Name] was successfully concluded, achieving all primary "
        "technical milestones and academic objectives. The experience provided crucial insights into commercial software development processes, "
        "team collaboration standards, and production-level engineering workflows."
    )
    doc.add_paragraph(
        "Through active participation in [Project Name], theoretical concepts learned in the classroom were successfully translated into practical software solutions. "
        "The internship fulfilled all requirements mandated by Pokhara University, serving as an invaluable foundation for a future professional engineering career."
    )

    h = doc.add_heading("4.2. Learning Outcome", level=2)
    doc.add_paragraph(
        "Students are expected to relate and contextualize academic concepts with their practical work performed at the host organization. "
        "The key contextualized learning outcomes gained include:"
    )
    outcomes = [
        "Technical Competence: Enhanced proficiency in full-stack development, API integration, database design, and version control (Git).",
        "Software Engineering Methodology: Deep understanding of Agile Scrum methodologies, code reviews, unit testing, and CI/CD automation.",
        "Problem-Solving & Debugging: Ability to systematically diagnose bugs, profile application performance, and apply optimized data structures.",
        "Professional & Soft Skills: Improved technical writing, teamwork, time management, and presentation skills within a commercial enterprise context."
    ]
    for o in outcomes:
        p = doc.add_paragraph(o, style='List Bullet')
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.space_after = Pt(2)

    doc.add_page_break()

    # -------------------------------------------------------------
    # REFERENCES (APA Style)
    # -------------------------------------------------------------
    h = doc.add_heading("REFERENCES", level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph(
        "The reference section contains all articles, books, and web resources cited directly in the document formatted according to APA 7th Edition standards:"
    )

    apa_refs = [
        "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.). https://doi.org/10.1037/0000165-000",
        "Fielding, R. T. (2000). Architectural styles and the design of network-based software architectures (Doctoral dissertation, University of California, Irvine).",
        "Fowler, M. (2018). Refactoring: Improving the design of existing code (2nd ed.). Addison-Wesley Professional.",
        "Pokhara University. (2024). Internship report guidelines and evaluation standard. Office of the Controller of Examinations, Pokhara University. https://apastyle.apa.org/",
        "Pressman, R. S., & Maxim, B. R. (2019). Software engineering: A practitioner's approach (9th ed.). McGraw-Hill Education."
    ]
    for ref in apa_refs:
        p = doc.add_paragraph(ref)
        p.paragraph_format.left_indent = Inches(0.5)
        p.paragraph_format.first_line_indent = Inches(-0.5)
        p.paragraph_format.space_after = Pt(6)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # BIBLIOGRAPHY
    h = doc.add_heading("BIBLIOGRAPHY", level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph(
        "The bibliography section lists background reading materials, technical documentation, and references studied during the internship but not explicitly cited inside the text:"
    )

    bib_items = [
        "Facebook Open Source. (2024). React documentation: Learn React. https://react.dev/",
        "MDN Web Docs. (2024). JavaScript guide and Web APIs documentation. Mozilla Developer Network. https://developer.mozilla.org/",
        "Spring Framework Team. (2024). Spring Boot reference documentation. VMware Tanzu. https://spring.io/projects/spring-boot"
    ]
    for bib in bib_items:
        p = doc.add_paragraph(bib)
        p.paragraph_format.left_indent = Inches(0.5)
        p.paragraph_format.first_line_indent = Inches(-0.5)
        p.paragraph_format.space_after = Pt(6)

    doc.add_page_break()

    # -------------------------------------------------------------
    # APPENDICES
    # -------------------------------------------------------------
    h = doc.add_heading("APPENDICES", level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER

    h = doc.add_heading("Appendix A: Screenshots & User Interfaces", level=2)
    doc.add_paragraph("[Place application screenshots, UI layout diagrams, and user workflow mockups here.]")

    h = doc.add_heading("Appendix B: Source Code Snippets", level=2)
    doc.add_paragraph("[Include core source code snippets, algorithm implementations, and configuration scripts here.]")
    
    # Sample code block formatting
    t_code = doc.add_table(rows=1, cols=1)
    style_table(t_code, header_bg="F8F8F8")
    p_code = t_code.rows[0].cells[0].paragraphs[0]
    p_code.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r_code = p_code.add_run(
        "// Sample Core Controller Snippet\n"
        "@RestController\n"
        "@RequestMapping(\"/api/v1/internship\")\n"
        "public class InternshipController {\n"
        "    @GetMapping(\"/status\")\n"
        "    public ResponseEntity<String> getStatus() {\n"
        "        return ResponseEntity.ok(\"Internship project module running successfully.\");\n"
        "    }\n"
        "}"
    )
    r_code.font.name = 'Courier New'
    r_code.font.size = Pt(10)

    h = doc.add_heading("Appendix C: Work Logs & Attendance Proof", level=2)
    doc.add_paragraph("[Attach signed daily/weekly attendance logs, host organization offer letter, and evaluation certificates here.]")

    # Save document
    doc.save(output_filename)
    print(f"Successfully generated document: {output_filename}")

if __name__ == "__main__":
    create_internship_report_document()
