(() => {
  'use strict';
  const output = document.getElementById('cyberOutput');
  const form = document.getElementById('cyberCommandForm');
  const input = document.getElementById('cyberCommand');
  const computer = document.getElementById('cyberComputer');
  const title = document.getElementById('cyberWindowTitle');
  const panels = [...document.querySelectorAll('[data-lab-panel]')];
  const tabButtons = [...document.querySelectorAll('[data-lab-tab]')];
  const editor = document.getElementById('pythonCode');
  const lineNumbers = document.getElementById('codeLineNumbers');
  const fileNameLabel = document.getElementById('activeFileName');
  const editorTabName = document.getElementById('editorTabName');
  const crtPreview = document.getElementById('cyberScreenCode');
  const result = document.getElementById('pythonDemoResult');
  const samples = {
    hello: {name:'hello_yxngj.py', lang:'PYTHON', code:`# YXNGJ // FIRST PYTHON SCRIPT
print("YXNGJ CYBER LAB")
print("Hello, operator!")
print("Status: READY")`},
    hash: {name:'sha256_demo.py', lang:'PYTHON', code:`# SHA-256 TEXT HASH DEMO
import hashlib

sample = "yxngj security lab"
digest = hashlib.sha256(sample.encode("utf-8")).hexdigest()
print("Sample:", sample)
print("SHA-256:", digest)`},
    password: {name:'password_check.py', lang:'PYTHON', code:`# BASIC PASSWORD STRENGTH CHECK — EDUCATIONAL
password = input("Enter a test password (not your real one): ")
checks = [
    len(password) >= 12,
    any(c.islower() for c in password),
    any(c.isupper() for c in password),
    any(c.isdigit() for c in password),
    any(not c.isalnum() for c in password),
]
print("Strength points:", sum(checks), "/ 5")`},
    ports: {name:'common_ports.py', lang:'PYTHON', code:`# COMMON NETWORK PORTS — STATIC REFERENCE
ports = {22: "SSH", 53: "DNS", 80: "HTTP", 443: "HTTPS", 3306: "MySQL"}
for port, service in ports.items():
    print(f"{port:>4}  {service}")`},
    js: {name:'status_ui.js', lang:'JAVASCRIPT', code:`// Update a page element safely with textContent
const status = document.querySelector("#status");
if (status) {
  status.textContent = "SYSTEM READY";
  status.dataset.state = "online";
}
console.log("YXNGJ interface loaded");`},
    base64: {name:'text_encoding.py', lang:'PYTHON', code:`# BASE64 TEXT ENCODING DEMO — NOT ENCRYPTION
import base64
message = "YXNGJ"
encoded = base64.b64encode(message.encode("utf-8")).decode("ascii")
decoded = base64.b64decode(encoded).decode("utf-8")
print("Original:", message)
print("Encoded:", encoded)
print("Decoded:", decoded)`},
    filehash: {name:'real_file_sha256.py', lang:'PYTHON', code:`# Calculate SHA-256 for a real file you own
from pathlib import Path
import hashlib
file_path = Path(input("File path: ").strip().strip('"'))
if not file_path.is_file():
    raise SystemExit("File not found. Check the path.")
hasher = hashlib.sha256()
with file_path.open("rb") as file:
    for chunk in iter(lambda: file.read(1024 * 1024), b""):
        hasher.update(chunk)
print("File:", file_path.name)
print("SHA-256:", hasher.hexdigest())`},
    generator: {name:'secure_password.py', lang:'PYTHON', code:`# Generate a random password with Python's secure RNG
import secrets
import string
length = 20
alphabet = string.ascii_letters + string.digits + "!@#$%^&*()-_=+"
password = "".join(secrets.choice(alphabet) for _ in range(length))
print(password)
# Save it in a password manager; never reuse it.`},
    localhost: {name:'localhost_ports.py', lang:'PYTHON', code:`# Check selected TCP ports on YOUR OWN computer only
import socket
HOST = "127.0.0.1"  # loopback: this computer only
PORTS = [22, 80, 443, 3000, 5000, 8000, 8080]
for port in PORTS:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.4)
        status = "OPEN" if sock.connect_ex((HOST, port)) == 0 else "closed"
        print(f"{port:>5}: {status}")`},
    headers: {name:'check_security_headers.py', lang:'PYTHON', code:`# Review security headers on a website you own/manage
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
url = input("Your website URL (https://...): ").strip()
if not url.startswith("https://"):
    raise SystemExit("Use HTTPS for this check.")
request = Request(url, headers={"User-Agent": "YXNGJ-Security-Lab/1.0"}, method="HEAD")
try:
    with urlopen(request, timeout=8) as response:
        headers = response.headers
        for name in ["Content-Security-Policy", "Strict-Transport-Security",
                     "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy"]:
            print(f"{name}: {headers.get(name, 'MISSING')}")
except (HTTPError, URLError, TimeoutError) as error:
    print("Request failed:", error)`}
  };
  const guides = {
    hello: {title:'شروع پایتون',purpose:'چند پیام را در ترمینال چاپ می‌کند و دستور print را آموزش می‌دهد.',use:'تمرین اولین اسکریپت و خروجی گرفتن',run:'python hello_yxngj.py',safety:'فقط متن چاپ می‌کند.'},
    hash: {title:'هش SHA-256 متن',purpose:'از متن یک اثرانگشت ثابت می‌سازد؛ تغییر کوچک در متن، هش متفاوتی می‌دهد.',use:'مقایسه یکپارچگی داده‌ها',run:'python sha256_demo.py',safety:'هش رمزنگاریِ قابل‌بازگشت نیست و اصالت را به‌تنهایی ثابت نمی‌کند.'},
    password: {title:'ارزیابی پایه گذرواژه',purpose:'طول و تنوع حروف، عدد و نمادها را بررسی می‌کند.',use:'یادگیری معیارهای گذرواژه قوی',run:'python password_check.py',safety:'فقط رمز آزمایشی وارد کن؛ این امتیازدهی ابزار ممیزی حرفه‌ای نیست.'},
    ports: {title:'آشنایی با پورت‌ها',purpose:'شماره پورت‌های رایج و سرویس‌های معمول را از یک جدول ثابت نمایش می‌دهد.',use:'یادگیری TCP و سرویس‌های شبکه',run:'python common_ports.py',safety:'اسکن شبکه نیست؛ فقط جدول اطلاعاتی است.'},
    js: {title:'تغییر امن متن صفحه',purpose:'یک عنصر HTML را پیدا می‌کند و متن و وضعیت آن را تغییر می‌دهد.',use:'ساخت رابط کاربری با JavaScript',run:'در صفحه HTML دارای عنصر #status اجرا کن',safety:'textContent متن را به‌عنوان HTML اجرا نمی‌کند.'},
    base64: {title:'کدگذاری Base64',purpose:'متن را به Base64 تبدیل و دوباره به متن اصلی برمی‌گرداند.',use:'شناخت قالب‌های انتقال و ذخیره متن',run:'python text_encoding.py',safety:'Base64 رمزنگاری نیست؛ اطلاعات محرمانه را با آن مخفی نکن.'},
    filehash: {title:'هش واقعی فایل',purpose:'فایل انتخابی خودت را می‌خواند و SHA-256 واقعی آن را محاسبه می‌کند.',use:'بررسی تغییر فایل و صحت نسخه‌ها',run:'python real_file_sha256.py و واردکردن مسیر فایل',safety:'فقط فایل را می‌خواند و تغییرش نمی‌دهد.'},
    generator: {title:'ساخت گذرواژه امن',purpose:'با ماژول secrets یک گذرواژه تصادفی ۲۰ کاراکتری می‌سازد.',use:'ساخت رمز منحصربه‌فرد برای حساب‌ها',run:'python secure_password.py',safety:'خروجی را در مدیر رمز ذخیره کن؛ در چت یا کد عمومی قرار نده.'},
    localhost: {title:'بررسی پورت‌های سیستم خودت',purpose:'فقط آدرس 127.0.0.1 را بررسی می‌کند تا وضعیت چند پورت روی همین کامپیوتر مشخص شود.',use:'عیب‌یابی سرویس‌های محلی',run:'python localhost_ports.py',safety:'محدود به کامپیوتر خودت است و دستگاه دیگری را اسکن نمی‌کند.'},
    headers: {title:'بررسی هدرهای امنیتی وب',purpose:'با درخواست HEAD به نشانی HTTPS، وجود چند هدر امنیتی رایج را گزارش می‌کند.',use:'بازبینی اولیه تنظیمات امنیتی سایت خودت',run:'python check_security_headers.py و سپس آدرس سایت خودت',safety:'فقط سایت خودت یا سایتی که اجازه بررسی داری؛ این تست ممیزی کامل نیست.'}
  };
  const starter = `// YXNGJ CODE SHOWCASE\n// Select a code sample below to load it here.\n\nconst status = "READY";\nconsole.log(status);`;
  let activeSample = 'hello';
  let typingTimer = null;
  function line(text, cls='') {
    const p = document.createElement('p');
    if (cls) p.className = cls;
    p.textContent = text;
    output?.appendChild(p);
    if (output) output.scrollTop = output.scrollHeight;
  }
  function updateLineNumbers() {
    if (!lineNumbers || !editor) return;
    const count = Math.max(1, editor.value.split('\n').length);
    lineNumbers.textContent = Array.from({length:count}, (_,i)=>i+1).join('\n');
    if (crtPreview) crtPreview.textContent = editor.value.split('\n').slice(0,7).join('\n') + (editor.value.split('\n').length > 7 ? '\n…' : '');
  }
  function activateTab(name) {
    panels.forEach(p=>p.classList.toggle('active',p.dataset.labPanel===name));
    tabButtons.forEach(b=>b.classList.toggle('active',b.dataset.labTab===name));
    const labels={terminal:'CONSOLE — YXNGJ',editor:'CODE EDITOR — OFFLINE',network:'LAB STATUS — DISCONNECTED'};
    if(title) title.textContent=labels[name] || labels.terminal;
  }
  function loadSample(key) {
    const sample = samples[key];
    if (!sample || !editor) return;
    activeSample = key;
    clearInterval(typingTimer);
    editor.value = sample.code;
    if(fileNameLabel) fileNameLabel.textContent=sample.name;
    if(editorTabName) editorTabName.textContent=sample.name;
    document.querySelectorAll('.cyber-file').forEach(b=>b.classList.toggle('active',b.dataset.file==='sample.py'));
    document.querySelectorAll('.cyber-sample-card').forEach(b=>b.classList.toggle('active',b.dataset.sample===key));
    activateTab('editor');
    updateLineNumbers();
    if(result) { result.textContent=`${sample.lang} SAMPLE LOADED — فقط پیش‌نمایش؛ اجرای کد در سایت غیرفعال است.`; result.classList.remove('result-error'); result.classList.add('result-active'); }
    const guide=guides[key];
    if(guide){
      const fields={cyberGuideTitle:guide.title,cyberGuidePurpose:guide.purpose,cyberGuideUse:guide.use,cyberGuideRun:guide.run,cyberGuideSafety:guide.safety};
      Object.entries(fields).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.textContent=value;});
    }
    if(crtPreview) {
      const full = sample.code;
      let i=0;
      crtPreview.textContent='';
      typingTimer=setInterval(()=>{
        i=Math.min(i+4,full.length);
        crtPreview.textContent=full.slice(0,i)+(i<full.length?' ▌':'');
        if(i>=full.length) clearInterval(typingTimer);
      },18);
    }
    line(`Loaded ${sample.name} into the code editor.`, 'term-green');
  }
  function openEditor(){activateTab('editor');document.querySelector('.cyber-panels')?.scrollIntoView({behavior:'smooth',block:'nearest'});editor?.focus({preventScroll:true});}
  tabButtons.forEach(b=>b.addEventListener('click',()=>activateTab(b.dataset.labTab)));
  computer?.addEventListener('click',openEditor);
  computer?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openEditor();}});
  document.querySelectorAll('.cyber-sample-card').forEach(b=>b.addEventListener('click',()=>loadSample(b.dataset.sample)));
  document.getElementById('jumpToCodeLibrary')?.addEventListener('click',()=>document.getElementById('cyberCodeLibrary')?.scrollIntoView({behavior:'smooth',block:'start'}));
  document.getElementById('backToCyberTop')?.addEventListener('click',()=>document.getElementById('cyber-lab')?.scrollTo({top:0,behavior:'smooth'}));
  // Save drafts only in this browser; no local Python, filesystem or server requests.
  document.getElementById('savePythonFile')?.addEventListener('click',()=>{
    try { localStorage.setItem('yxngj-cyberlab-draft',editor?.value || ''); if(result){result.textContent='Draft saved in this browser only.';result.classList.add('result-active');} }
    catch (_) { if(result) result.textContent='Browser storage is unavailable. You can still copy your code.'; }
  });
  document.getElementById('copyCodeSample')?.addEventListener('click',async()=>{
    try { await navigator.clipboard.writeText(editor?.value || ''); if(result){result.textContent='Code copied to clipboard.';result.classList.add('result-active');} }
    catch (_) { if(result) result.textContent='Clipboard permission unavailable. Select the code and copy it manually.'; }
  });
  document.querySelectorAll('.cyber-file').forEach(b=>b.addEventListener('click',()=>{
    if(b.dataset.file==='draft.py') {
      let draft=''; try { draft=localStorage.getItem('yxngj-cyberlab-draft') || ''; } catch (_) {}
      editor.value=draft || '# Your browser-only draft\n# Write code here. It will not be executed.\n';
      if(fileNameLabel)fileNameLabel.textContent='draft.py'; if(editorTabName)editorTabName.textContent='draft.py';
      document.querySelectorAll('.cyber-file').forEach(x=>x.classList.toggle('active',x===b)); updateLineNumbers(); activateTab('editor');
    } else loadSample(activeSample);
  }));
  editor?.addEventListener('input',updateLineNumbers);
  editor?.addEventListener('scroll',()=>{if(lineNumbers)lineNumbers.scrollTop=editor.scrollTop;});
  editor?.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const a=editor.selectionStart,b=editor.selectionEnd;editor.setRangeText('    ',a,b,'end');updateLineNumbers();}});
  editor?.addEventListener('keyup',()=>{const before=editor.value.slice(0,editor.selectionStart);const ln=before.split('\n').length,col=before.length-(before.lastIndexOf('\n')+1);const cursor=document.getElementById('ideCursorStatus');if(cursor)cursor.textContent=`Ln ${ln}, Col ${col+1}`;});
  const simulated={help:['Available showcase commands:','  help       show this list','  list       show code samples','  editor     open the code editor','  clear      clear this console'],list:['01 HELLO YXNGJ','02 FILE HASH DEMO','03 PASSWORD CHECK','04 PORT CONCEPTS','05 LIVE STATUS UI','06 TEXT ENCODING','07 REAL FILE SHA-256','08 SECURE PASSWORD GENERATOR','09 LOCALHOST PORT CHECK','10 WEB SECURITY HEADERS'],editor:['Opening the offline code editor…']};
  form?.addEventListener('submit',e=>{
    e.preventDefault();const cmd=(input?.value||'').trim().toLowerCase();if(!cmd)return;line(`operator@yxngj:~$ ${cmd}`,'term-command');input.value='';
    if(cmd==='clear'){output.innerHTML='';return;}
    if(cmd==='editor'){activateTab('editor');return;}
    if(simulated[cmd]) simulated[cmd].forEach(t=>line(t,'term-highlight'));
    else line(`Unknown showcase command: ${cmd}. Type help.`, 'term-warning');
  });
  updateLineNumbers();
  // Always begin in disconnected, browser-only mode. No fetch calls are made by this file.
  if (editor) { try { const draft=localStorage.getItem('yxngj-cyberlab-draft'); if(draft && draft.trim()) editor.value=draft; } catch (_) {} }
  activateTab('terminal');
})();
