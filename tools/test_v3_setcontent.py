from playwright.sync_api import sync_playwright
from pathlib import Path
import json
html=Path('/mnt/data/ai-app-academy-varied-v3.html').read_text(encoding='utf-8')
seed={
'ai-academy-l1-exam':'true','ai-academy-l2-exam':'true','ai-academy-l3-exam':'true','ai-academy-l4-exam':'true','ai-academy-column1-exam':'true',
'ai-academy-l5-exam':'true','ai-academy-l6-exam':'true','ai-academy-l7-exam':'true','ai-academy-l8-exam':'true'
}
seed_script='<script>window.__academyMemory='+json.dumps(seed)+';</script>'
html=html.replace('<body>', '<body>'+seed_script, 1)
errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1280,'height':900})
    page.on('console', lambda msg: errors.append('console:'+msg.text) if msg.type=='error' else None)
    page.on('pageerror', lambda exc: errors.append('pageerror:'+str(exc)))
    page.set_content(html, wait_until='load')
    assert page.locator('#dashboardView').is_visible()

    # L3
    page.locator('#lesson3Entry').click()
    page.locator('[data-l3-pred="promise"]').click()
    for _ in range(4):
        page.locator('#l3Apply').click(); page.locator('#l3Diagnose').click(); page.wait_for_timeout(450)
    assert page.locator('#l3-reveal').evaluate("e=>e.classList.contains('reveal-unlocked')")
    page.locator('#l3Transfer [data-answer="unknown"]').click(); page.locator('#l3Transfer [data-answer="zod"]').click(); page.locator('#l3CheckTransfer').click(); page.locator('#l3Quiz [data-correct="true"]').click()
    assert page.locator('#l3ExamButton').is_enabled()
    page.locator('#lesson3View [data-view="dashboard"]').first.click()

    # L4
    page.locator('#lesson4Entry').click(); page.locator('[data-l4-pred="history"]').click()
    for item in ['system','history','document']: page.locator(f'[data-item="{item}"]').click()
    page.locator('#l4Turns').fill('0'); page.locator('#l4Run').click(); assert '✓' in page.locator('#l4Result').inner_text()
    page.locator('#l4Quiz [data-correct="true"]').click(); assert page.locator('#l4ExamButton').is_enabled(); page.locator('#lesson4View [data-view="dashboard"]').first.click()

    # L6
    page.locator('#lesson6Entry').click(); page.locator('[data-l6-pred="business"]').click(); page.locator('#l6Unknown').check(); page.locator('#l6ArrivalPriority').check(); page.locator('#l6Run').click(); assert page.locator('#l6Accuracy').inner_text()=='6/6'
    page.locator('#l6Quiz [data-correct="true"]').click(); assert page.locator('#l6ExamButton').is_enabled(); page.locator('#lesson6View [data-view="dashboard"]').first.click()

    # L7
    page.locator('#lesson7Entry').click(); page.locator('[data-l7-pred="business"]').click()
    valid='''{\n  "intent":"refund_query",\n  "confidence":0.91,\n  "reason":"询问到账时间"\n}'''
    page.locator('#l7Editor').fill(valid); page.locator('#l7Run').click(); page.wait_for_timeout(450)
    page.locator('#l7Editor').fill(valid); page.locator('#l7Run').click(); page.wait_for_timeout(450)
    low='''{\n  "intent":"unknown",\n  "confidence":0.2,\n  "reason":"信息不足"\n}'''
    page.locator('#l7Editor').fill(low); page.locator('#l7Run').click(); page.wait_for_timeout(450)
    assert page.locator('#l7-reveal').evaluate("e=>e.classList.contains('reveal-unlocked')")
    page.locator('#l7Quiz [data-correct="true"]').click(); assert page.locator('#l7ExamButton').is_enabled(); page.locator('#lesson7View [data-view="dashboard"]').first.click()

    # L8
    page.locator('#lesson8Entry').click(); page.locator('[data-l8-pred="no"]').click()
    for text in ['不满+问到账','纯服务投诉','信息不足→unknown']: page.get_by_text(text, exact=False).click()
    page.locator('#l8Run').click(); assert page.locator('#l8-reveal').evaluate("e=>e.classList.contains('reveal-unlocked')")
    page.locator('#l8Quiz [data-correct="true"]').click(); assert page.locator('#l8ExamButton').is_enabled(); page.locator('#lesson8View [data-view="dashboard"]').first.click()

    # L9
    page.locator('#lesson9Entry').click(); page.locator('[data-l9-pred="dataset"]').click(); page.locator('#l9Run').click(); assert page.locator('#l9Regression').inner_text()=='1'
    prompt=page.locator('#l9Prompt').input_value().replace('退款申请缺订单号时返回 unknown。','退款申请缺订单号时仍返回 refund，并在 reason 说明缺少订单号。')
    page.locator('#l9Prompt').fill(prompt); page.locator('#l9Run').click(); assert page.locator('#l9Accuracy').inner_text()=='100%'
    page.locator('#l9Quiz [data-correct="true"]').click(); assert page.locator('#l9ExamButton').is_enabled(); page.locator('#lesson9View [data-view="dashboard"]').first.click(); page.wait_for_timeout(100)
    ready=page.locator('#artifactLedgerGrid .artifact-card.ready').count(); assert ready>=6,ready

    # mobile overflow by changing viewport and opening views
    page.set_viewport_size({'width':390,'height':844})
    for id_ in [3,4,6,7,8,9]:
        page.locator(f'#lesson{id_}Entry').click(); page.wait_for_timeout(60)
        overflow=page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
        assert overflow<=1,(id_,overflow)
        page.locator(f'#lesson{id_}View [data-view="dashboard"]').first.click()
    print(json.dumps({'ready_artifacts':ready,'errors':errors},ensure_ascii=False))
    browser.close()
