(() => {
  'use strict';
  const panel = document.getElementById('squadSelection');
  const name = document.getElementById('selectedSquadName');
  const role = document.getElementById('selectedSquadRole');
  const close = document.getElementById('closeSquadSelection');
  if (!panel || !name || !role || !close) return;
  const members = {
    'X-01': 'LEADER // VOID BLADE',
    'NYX': 'ASSASSIN // TWIN ENERGY SWORDS',
    'RIN': 'BLADE // PHASE KATANA',
    'EVA': 'SNIPER // PLASMA EDGE',
    'MIRA': 'TECH // CYBER SABER'
  };
  document.querySelectorAll('[data-squad]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-squad');
      name.textContent = id;
      role.textContent = members[id] || 'SQUAD MEMBER';
      panel.hidden = false;
      document.querySelectorAll('[data-squad]').forEach(item => { const selected = item === button; item.setAttribute('aria-pressed', String(selected)); item.classList.toggle('is-selected', selected); });
    });
  });
  close.addEventListener('click', () => { panel.hidden = true; });
})();
