with open('E:/pyrolens/pyrolens-app/src/pages/ReportBuilder.jsx', 'r') as f:
    content = f.read()

idx = content.find('{selectedTemplate !== "custom" && (')
if idx >= 0:
    end_idx = content.find('        </Card>', idx)
    if end_idx >= 0:
        old_block = content[idx:end_idx+11]
        
        new_block = '''{selectedTemplate !== "custom" && (
            <>
              <div className="space-y-2 text-xs text-slate-500">
                <p>Events will be auto-selected based on template:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {selectedTemplate === "incident_brief" && <li>Select one event below</li>}
                  {selectedTemplate === "daily_summary" && <li>Top 20 events from last 24h</li>}
                  {selectedTemplate === "risk_assessment" && <li>CRITICAL + HIGH risk events (max 20)</li>}
                  {selectedTemplate === "sector_report" && <li>All events in monitoring area</li>}
                </ul>
              </div>

              {selectedTemplate === "incident_brief" && selectedEvents.length === 0 && active.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs text-amber-800">Select an event for the incident brief:</p>
                  <select
                    value={selectedEvents[0] || ""}
                    onChange={(e) => setSelectedEvents(e.target.value ? [e.target.value] : [])}
                    className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ink outline-none focus:border-orange"
                  >
                    <option value="">Choose event...</option>
                    {active.map(event => (
                      <option key={event.id} value={event.id}>{event.id} · {event.frp} · {event.confidence}%</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </Card>'''
        
        if old_block in content:
            content = content[:idx] + new_block + content[end_idx+11:]
            with open('E:/pyrolens/pyrolens-app/src/pages/ReportBuilder.jsx', 'w') as f:
                f.write(content)
            print('Fixed!')
        else:
            print('Old block not found exactly')
else:
    print('Start not found')