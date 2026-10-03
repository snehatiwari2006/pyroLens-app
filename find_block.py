with open('E:/pyrolens/pyrolens-app/src/pages/ReportBuilder.jsx', 'r') as f:
    content = f.read()

idx = content.find('{selectedTemplate !== "custom" && (')
if idx >= 0:
    end_idx = content.find('        </Card>', idx)
    if end_idx >= 0:
        print("Found block from", idx, "to", end_idx)
        print("Block length:", end_idx - idx + 11)
        print("---")
        print(content[idx:end_idx+11])
        print("---")