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
    hello: {name:'hello_yxngj.py', lang:'PYTHON', code:`# YXNGJ // FIRST PYTHON SCRIPT\nprint("YXNGJ CYBER LAB")\nprint("Hello, operator!")\nprint("Status: READY")`},
    hash: {name:'sha256_demo.py', lang:'PYTHON', code:`# SHA-256 TEXT HASH DEMO\nimport hashlib\n\nsample = "yxngj security lab"\ndigest = hashlib.sha256(sample.encode("utf-8")).hexdigest()\nprint("Sample:", sample)\nprint("SHA-256:", digest)`},
    password: {name:'password_check.py', lang:'PYTHON', code:`# BASIC PASSWORD STRENGTH CHECK\n# Educational example only — not a production validator.\npassword = "Example-Password-2026!"\nscore = 0\nscore += len(password) >= 12\nscore += any(c.islower() for c in password)\nscore += any(c.isupper() for c in password)\nscore += any(c.isdigit() for c in password)\nscore += any(not c.isalnum() for c in password)\nprint("Strength points:", score, "/ 5")`},
    ports: {name:'common_ports.py', lang:'PYTHON', code:`# COMMON NETWORK PORTS — STATIC REFERENCE\nports = {\n    22: "SSH",\n    53: "DNS",\n    80: "HTTP",\n    443: "HTTPS",\n    3306: "MySQL",\n}\nfor port, service in ports.items():\n    print(f"{port:>4}  {service}")`},
    js: {name:'status_ui.js', lang:'JAVASCRIPT', code:`// YXNGJ // BROWSER STATUS LABEL\nconst status = document.querySelector("#status");\nif (status) {\n  status.textContent = "SYSTEM READY";\n  status.dataset.state = "online";\n}\nconsole.log("YXNGJ interface loaded");`},
    base64: {name:'text_encoding.py', lang:'PYTHON', code:`# BASE64 TEXT ENCODING DEMO\nimport base64\n\nmessage = "YXNGJ"\nencoded = base64.b64encode(message.encode()).decode()\ndecoded = base64.b64decode(encoded).decode()\nprint("Original:", message)\nprint("Encoded:", encoded)\nprint("Decoded:", decoded)`}
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
    if(result) { result.textContent=`${sample.lang} SAMPLE LOADED — preview only. Code execution is disabled.`; result.classList.remove('result-error'); result.classList.add('result-active'); }
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
  const simulated={help:['Available showcase commands:','  help       show this list','  list       show code samples','  editor     open the code editor','  clear      clear this console'],list:['01 HELLO YXNGJ','02 FILE HASH DEMO','03 PASSWORD CHECK','04 PORT CONCEPTS','05 LIVE STATUS UI','06 TEXT ENCODING'],editor:['Opening the offline code editor…']};
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
