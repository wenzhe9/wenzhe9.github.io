from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

OUT = "output/pdf/wenzhe-xu-cv.pdf"
styles = getSampleStyleSheet()
title = ParagraphStyle("Title", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=24, leading=28, textColor=colors.HexColor("#202632"), spaceAfter=5*mm)
section = ParagraphStyle("Section", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=colors.HexColor("#738a72"), spaceBefore=5*mm, spaceAfter=2*mm, uppercase=True)
body = ParagraphStyle("Body", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=14, textColor=colors.HexColor("#343a43"))
meta = ParagraphStyle("Meta", parent=body, fontSize=8.7, textColor=colors.HexColor("#676d74"))

doc = SimpleDocTemplate(OUT, pagesize=A4, rightMargin=19*mm, leftMargin=19*mm, topMargin=17*mm, bottomMargin=17*mm)
story = [
    Paragraph("Wenzhe Xu", title),
    Paragraph("Researcher · Human–Computer Interaction · Responsible Innovation", body),
    Spacer(1, 2*mm),
    Paragraph("wenzhexu19@gmail.com &nbsp;&nbsp; github.com/wenzhe9 &nbsp;&nbsp; linkedin.com/in/wz-xu", meta),
    Paragraph("PROFILE", section),
    Paragraph("Researcher interested in how people understand, use, and live with emerging technologies. Replace this temporary summary with your final positioning statement.", body),
    Paragraph("EDUCATION", section),
    Paragraph("Degree / Programme — University or Institution", body),
    Paragraph("20XX–20XX · Field of study, supervisor, and selected achievements.", meta),
    Paragraph("RESEARCH EXPERIENCE", section),
]

rows = []
for i in range(1, 4):
    rows.append([Paragraph("20XX–20XX", meta), Paragraph(f"Research position {i}<br/><font color='#676d74'>Organisation · Add responsibilities, methods, and outcomes.</font>", body)])
table = Table(rows, colWidths=[31*mm, 130*mm], rowHeights=[18*mm]*3)
table.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LINEBELOW", (0,0), (-1,-2), .4, colors.HexColor("#d9dee1")), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 4)]))
story += [table, Paragraph("SELECTED PROJECTS", section)]
for i in range(1, 4):
    story += [Paragraph(f"Project {i:02d} — Add project title", body), Paragraph("Add a one-line description, your role, methods, and research output.", meta), Spacer(1, 2*mm)]
story += [Paragraph("SKILLS", section), Paragraph("Research methods · Prototyping · Data analysis · Add relevant tools and languages", body)]
doc.build(story)
