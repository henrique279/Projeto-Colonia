// =============================================
//   PetAmigo — Lógica Principal
// =============================================

// ── Estado global ──
var svcSel   = null;
var svcPreco = 0;
var svcDur   = '';
var dataSel  = null;
var agendamentos = [];
var cartItems = [];
var cartTot   = 0;
var notifNaoLidas = 2;

var pets = [
  { nome: 'Rex',  tipo: 'Cachorro' },
  { nome: 'Luna', tipo: 'Gato' }
];

var extratoPontos = [
  { desc: 'Consulta Vet — Rex',    pts: +100, data: '02/06' },
  { desc: 'Banho + Tosa — Luna',   pts: +80,  data: '10/06' },
  { desc: 'Resgate de desconto',   pts: -30,  data: '15/06' }
];

var endereco = {
  rua: 'Rua das Flores', num: '142',
  comp: '', bairro: 'Jardim Primavera',
  cidade: 'São Paulo', uf: 'SP'
};

// ── Relógio na status bar ──
function atualizarRelogio() {
  var agora = new Date();
  var h = agora.getHours().toString().padStart(2, '0');
  var m = agora.getMinutes().toString().padStart(2, '0');
  var el = document.getElementById('relogioSb');
  if (el) el.textContent = h + ':' + m;
}
atualizarRelogio();
setInterval(atualizarRelogio, 30000);

// ── Navegação entre páginas ──
var paginaAtual = 'Home';

function navTo(pg) {
  // Esconde todas as páginas
  document.querySelectorAll('.pg').forEach(function(p) {
    p.classList.remove('act');
  });

  // Mapa nome → id
  var map = {
    Home:    'pgHome',
    Agenda:  'pgAgenda',
    Loja:    'pgLoja',
    Perfil:  'pgPerfil',
    Confirm: 'pgConfirm'
  };

  if (map[pg]) document.getElementById(map[pg]).classList.add('act');
  paginaAtual = pg;

  // Atualiza bottom nav em todas as páginas
  document.querySelectorAll('.bnav').forEach(function(nav) {
    nav.querySelectorAll('.ni').forEach(function(ni) {
      ni.classList.remove('act');
    });
    var idx = { Home: 0, Agenda: 1, Loja: 2, Perfil: 3 };
    if (idx[pg] !== undefined) {
      var items = nav.querySelectorAll('.ni');
      if (items[idx[pg]]) items[idx[pg]].classList.add('act');
    }
  });

  // Fecha qualquer overlay aberto
  document.querySelectorAll('.overlay').forEach(function(o) {
    o.classList.remove('show');
  });
}

// ── Overlays / Modais ──
function abrirOverlay(id) {
  document.getElementById(id).classList.add('show');
}

function fecharOverlay(id) {
  document.getElementById(id).classList.remove('show');
}

// ── Notificações ──
function lerNotif(id) {
  var dot = document.getElementById(id.replace('notif', 'dot'));
  var item = document.getElementById(id);
  if (dot && dot.style.background !== 'rgb(221, 229, 245)') {
    dot.style.background = '#DDE5F5';
    item.style.opacity = '0.55';
    notifNaoLidas = Math.max(0, notifNaoLidas - 1);
    atualizarBadgeNotif();
  }
}

function marcarTodasLidas() {
  ['notif1','notif2','notif3'].forEach(function(id) { lerNotif(id); });
}

function atualizarBadgeNotif() {
  ['notifBadge','notifBadge2'].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (notifNaoLidas > 0) {
      el.textContent = notifNaoLidas;
      el.style.display = 'flex';
    } else {
      el.style.display = 'none';
    }
  });
  var sub = document.getElementById('menuNotifSub');
  if (sub) sub.textContent = notifNaoLidas > 0 ? notifNaoLidas + ' não lida(s)' : 'Tudo em dia';
}

// ── Seleção de serviço ──
function selSvc(el, nome, preco, dur) {
  document.querySelectorAll('.svc-tile').forEach(function(c) { c.classList.remove('sel'); });
  el.classList.add('sel');
  svcSel = nome; svcPreco = preco; svcDur = dur;
  document.getElementById('errBar').classList.remove('show');
}

// ── Seleção de data ──
function selData(el, data) {
  document.querySelectorAll('.dc').forEach(function(c) { c.classList.remove('sel'); });
  el.classList.add('sel');
  dataSel = data;
  document.getElementById('errBar').classList.remove('show');
}

// ── Agendar ──
function agendar() {
  var t  = document.getElementById('inTutor').value.trim();
  var p  = document.getElementById('inPet').value.trim();
  var a  = document.getElementById('inAnimal').value;
  var errBar = document.getElementById('errBar');
  var errMsg = document.getElementById('errMsg');

  if (!t || !p || !a) { errMsg.textContent = 'Preencha os dados do pet!'; errBar.classList.add('show'); return; }
  if (!svcSel)        { errMsg.textContent = 'Escolha um serviço!';        errBar.classList.add('show'); return; }
  if (!dataSel)       { errMsg.textContent = 'Escolha uma data!';           errBar.classList.add('show'); return; }

  agendamentos.push({ tutor:t, pet:p, animal:a, svc:svcSel, preco:svcPreco, dur:svcDur, data:dataSel });
  atualizarAgenda();

  // Preenche confirmação
  document.getElementById('cfTitle').textContent  = 'Tudo certo, ' + t.split(' ')[0] + '!';
  document.getElementById('cfSub').textContent     = p + ' está no calendário. Até lá!';
  document.getElementById('rTutor').textContent    = t;
  document.getElementById('rPet').textContent      = p;
  document.getElementById('rAnimal').textContent   = a;
  document.getElementById('rSvc').textContent      = svcSel;
  document.getElementById('rData').textContent     = dataSel;
  document.getElementById('rDur').textContent      = svcDur;
  document.getElementById('rTotal').textContent    = 'R$ ' + svcPreco.toFixed(2).replace('.', ',');

  // Endereço na tag de confirmação
  var endLabel = endereco.rua + ', ' + endereco.num;
  document.getElementById('tagEndereco').textContent = endLabel;

  // Atualiza stats e perfil
  var statAg = document.getElementById('statAg');
  statAg.textContent = parseInt(statAg.textContent) + 1;
  adicionarPontos(svcPreco / 2 | 0, 'Agendamento: ' + svcSel);
  document.getElementById('perfilNome').textContent = t;
  document.getElementById('perfilSub').textContent  = 'Tutor de ' + p;

  navTo('Confirm');
}

// ── Atualizar lista de agenda ──
function atualizarAgenda() {
  var lista = document.getElementById('agendaList');
  var sub   = document.getElementById('agSub');
  if (agendamentos.length === 0) {
    lista.innerHTML = '<div class="empty-state"><i class="ti ti-calendar-off"></i><p>Nenhum agendamento ainda.<br>Agende um serviço na tela inicial!</p></div>';
    sub.textContent = 'Nenhum agendamento ainda';
    return;
  }
  sub.textContent = agendamentos.length + ' agendamento(s) próximo(s)';
  lista.innerHTML = agendamentos.map(function(ag, i) {
    var partes = ag.data.split(', ');
    var diaNum = partes[1] ? partes[1].split('/')[0] : '—';
    var mes    = partes[1] ? partes[1].split('/')[1] : '—';
    return (
      '<div class="ag-card">' +
        '<div class="ag-date-box"><div class="adb-d">' + diaNum + '</div><div class="adb-m">' + mes + '</div></div>' +
        '<div class="ag-info"><h3>' + ag.svc + ' — ' + ag.pet + '</h3><p>' + ag.animal + ' • ' + ag.dur + '</p>' +
        '<div class="ag-badge conf"><i class="ti ti-clock"></i>Confirmado</div></div>' +
        '<span class="ag-price">R$ ' + ag.preco.toFixed(2).replace('.', ',') + '</span>' +
        '<button class="ag-cancel" onclick="cancelarAg(' + i + ')" aria-label="Cancelar"><i class="ti ti-x" style="font-size:16px"></i></button>' +
      '</div>'
    );
  }).join('');
}

function cancelarAg(i) {
  agendamentos.splice(i, 1);
  atualizarAgenda();
  var s = document.getElementById('statAg');
  if (parseInt(s.textContent) > 0) s.textContent = parseInt(s.textContent) - 1;
}

function voltarHome() {
  ['inTutor','inPet','inTel'].forEach(function(id) { document.getElementById(id).value = ''; });
  document.getElementById('inAnimal').value = '';
  document.querySelectorAll('.svc-tile').forEach(function(c) { c.classList.remove('sel'); });
  document.querySelectorAll('.dc').forEach(function(c) { c.classList.remove('sel'); });
  svcSel = null; svcPreco = 0; svcDur = ''; dataSel = null;
  document.getElementById('errBar').classList.remove('show');
  navTo('Home');
}

// ── Loja / Carrinho ──
function addCart(btn, preco, nome) {
  cartItems.push({ nome: nome, preco: preco });
  cartTot += preco;
  document.getElementById('cartCount').textContent = cartItems.length;
  document.getElementById('cartTotal').textContent = 'R$ ' + cartTot.toFixed(2).replace('.', ',');
  // Badge no ícone do carrinho
  var badge = document.getElementById('cartBadge');
  badge.textContent = cartItems.length;
  badge.style.display = 'flex';
  // Toast
  var toast = document.getElementById('cartToast');
  toast.textContent = nome + ' adicionado!';
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 2000);
  // Feedback no botão
  btn.style.background = '#1D9E75';
  setTimeout(function() { btn.style.background = '#0D1B3E'; }, 800);
}

function renderCarrinho() {
  var lista = document.getElementById('carrinhoLista');
  var totalModal = document.getElementById('carrinhoTotalModal');
  if (cartItems.length === 0) {
    lista.innerHTML = '<div class="empty-state" style="padding:24px 16px"><i class="ti ti-shopping-cart-off"></i><p>Carrinho vazio!<br>Adicione produtos da loja.</p></div>';
    totalModal.textContent = 'R$ 0,00';
    return;
  }
  lista.innerHTML = cartItems.map(function(item, i) {
    return (
      '<div class="rrow">' +
        '<span class="rlabel"><i class="ti ti-package"></i>' + item.nome + '</span>' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<span class="rval">R$ ' + item.preco.toFixed(2).replace('.', ',') + '</span>' +
          '<button class="ag-cancel" style="font-size:16px" onclick="removerItem(' + i + ')" aria-label="Remover"><i class="ti ti-x"></i></button>' +
        '</div>' +
      '</div>'
    );
  }).join('');
  totalModal.textContent = 'R$ ' + cartTot.toFixed(2).replace('.', ',');
}

function removerItem(i) {
  cartTot -= cartItems[i].preco;
  if (cartTot < 0) cartTot = 0;
  cartItems.splice(i, 1);
  document.getElementById('cartCount').textContent = cartItems.length;
  document.getElementById('cartTotal').textContent = 'R$ ' + cartTot.toFixed(2).replace('.', ',');
  var badge = document.getElementById('cartBadge');
  if (cartItems.length > 0) { badge.textContent = cartItems.length; } else { badge.style.display = 'none'; }
  renderCarrinho();
}

function limparCarrinho() {
  cartItems = []; cartTot = 0;
  document.getElementById('cartCount').textContent = '0';
  document.getElementById('cartTotal').textContent = 'R$ 0,00';
  document.getElementById('cartBadge').style.display = 'none';
  renderCarrinho();
}

function finalizarCompra() {
  if (cartItems.length === 0) return;
  fecharOverlay('carrinhoOverlay');
  var total = cartTot.toFixed(2).replace('.', ',');
  limparCarrinho();
  // Toast de sucesso
  var toast = document.getElementById('cartToast');
  toast.textContent = 'Pedido realizado! Entrega em até 3 dias.';
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 3000);
}

// ── Pets ──
function abrirPets() {
  renderPets();
  abrirOverlay('petsOverlay');
}

function renderPets() {
  var lista = document.getElementById('petsLista');
  if (pets.length === 0) {
    lista.innerHTML = '<div class="empty-state" style="padding:20px"><i class="ti ti-paw-off"></i><p>Nenhum pet cadastrado ainda.</p></div>';
    return;
  }
  lista.innerHTML = pets.map(function(pet, i) {
    var emojis = { Cachorro:'🐶', Gato:'🐱', Coelho:'🐰', Hamster:'🐹', Pássaro:'🦜' };
    return (
      '<div class="notif-item" style="justify-content:space-between;align-items:center">' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<div style="font-size:24px">' + (emojis[pet.tipo] || '🐾') + '</div>' +
          '<div><p style="font-size:13px;font-weight:500;color:#0D1B3E">' + pet.nome + '</p>' +
          '<span style="font-size:11px;color:#6B8CC7">' + pet.tipo + '</span></div>' +
        '</div>' +
        '<button class="ag-cancel" onclick="removerPet(' + i + ')" aria-label="Remover pet"><i class="ti ti-trash" style="font-size:15px"></i></button>' +
      '</div>'
    );
  }).join('');
}

function adicionarPet() {
  var nome = document.getElementById('novoPetNome').value.trim();
  var tipo = document.getElementById('novoPetTipo').value;
  if (!nome || !tipo) return;
  pets.push({ nome: nome, tipo: tipo });
  document.getElementById('novoPetNome').value = '';
  document.getElementById('novoPetTipo').value = '';
  atualizarMenuPets();
  renderPets();
}

function removerPet(i) {
  pets.splice(i, 1);
  atualizarMenuPets();
  renderPets();
}

function atualizarMenuPets() {
  var sub = document.getElementById('menuPetsSub');
  var stat = document.getElementById('statPets');
  if (pets.length === 0) { sub.textContent = 'Nenhum pet cadastrado'; }
  else { sub.textContent = pets.map(function(p) { return p.nome; }).join(', '); }
  stat.textContent = pets.length;
}

// ── Pontos ──
function adicionarPontos(qtd, desc) {
  var hoje = new Date();
  var data = hoje.getDate().toString().padStart(2,'0') + '/' + (hoje.getMonth()+1).toString().padStart(2,'0');
  extratoPontos.push({ desc: desc, pts: +qtd, data: data });
  var statPts = document.getElementById('statPts');
  statPts.textContent = parseInt(statPts.textContent) + qtd;
  document.getElementById('menuPontosSub').textContent = statPts.textContent + ' pontos disponíveis';
}

function abrirPontos() {
  var pts = parseInt(document.getElementById('statPts').textContent);
  document.getElementById('modalPontos').textContent = pts;
  var extrato = document.getElementById('pontosExtrato');
  extrato.innerHTML = extratoPontos.slice().reverse().map(function(e) {
    var cor = e.pts > 0 ? '#065F46' : '#991B1B';
    var bg  = e.pts > 0 ? '#D1FAE5' : '#FEE2E2';
    return (
      '<div class="rrow">' +
        '<span class="rlabel"><i class="ti ti-star"></i>' + e.desc + '<br><small style="color:#A8B8D8">' + e.data + '</small></span>' +
        '<span style="background:' + bg + ';color:' + cor + ';border-radius:8px;padding:3px 10px;font-size:12px;font-weight:500">' +
          (e.pts > 0 ? '+' : '') + e.pts + ' pts' +
        '</span>' +
      '</div>'
    );
  }).join('');
  abrirOverlay('pontosOverlay');
}

function resgatarPontos() {
  var statPts = document.getElementById('statPts');
  var pts = parseInt(statPts.textContent);
  if (pts < 100) { alert('Você precisa de pelo menos 100 pontos para resgatar!'); return; }
  var hoje = new Date();
  var data = hoje.getDate().toString().padStart(2,'0') + '/' + (hoje.getMonth()+1).toString().padStart(2,'0');
  extratoPontos.push({ desc: 'Resgate: cupom 10% off', pts: -100, data: data });
  statPts.textContent = pts - 100;
  document.getElementById('menuPontosSub').textContent = (pts - 100) + ' pontos disponíveis';
  abrirPontos();
  var toast = document.getElementById('cartToast');
  toast.textContent = 'Cupom PETDESC10 gerado! Use no próximo agendamento.';
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 3500);
}

// ── Endereço ──
function abrirEndereco() {
  document.getElementById('endRua').value    = endereco.rua;
  document.getElementById('endNum').value    = endereco.num;
  document.getElementById('endComp').value   = endereco.comp;
  document.getElementById('endBairro').value = endereco.bairro;
  document.getElementById('endCidade').value = endereco.cidade;
  document.getElementById('endUf').value     = endereco.uf;
  abrirOverlay('enderecoOverlay');
}

function salvarEndereco() {
  var rua    = document.getElementById('endRua').value.trim();
  var num    = document.getElementById('endNum').value.trim();
  var comp   = document.getElementById('endComp').value.trim();
  var bairro = document.getElementById('endBairro').value.trim();
  var cidade = document.getElementById('endCidade').value.trim();
  var uf     = document.getElementById('endUf').value.trim();
  if (!rua || !num || !cidade) { alert('Preencha pelo menos rua, número e cidade.'); return; }
  endereco = { rua:rua, num:num, comp:comp, bairro:bairro, cidade:cidade, uf:uf };
  var label = rua + ', ' + num + (comp ? ' ' + comp : '');
  document.getElementById('menuEndSub').textContent = label;
  fecharOverlay('enderecoOverlay');
}

// ── Perfil: editar nome ──
function editarPerfil() {
  var nomeAtual = document.getElementById('perfilNome').textContent;
  var novoNome  = prompt('Seu nome:', nomeAtual);
  if (novoNome && novoNome.trim()) {
    document.getElementById('perfilNome').textContent = novoNome.trim();
  }
}

// ── Logout ──
function fazerLogout() {
  var confirmar = confirm('Deseja sair da sua conta?');
  if (!confirmar) return;
  // Reseta tudo
  agendamentos = []; cartItems = []; cartTot = 0; notifNaoLidas = 0;
  svcSel = null; svcPreco = 0; svcDur = ''; dataSel = null;
  pets = [{ nome:'Rex', tipo:'Cachorro' }, { nome:'Luna', tipo:'Gato' }];
  extratoPontos = [
    { desc:'Consulta Vet — Rex',  pts:+100, data:'02/06' },
    { desc:'Banho + Tosa — Luna', pts:+80,  data:'10/06' },
    { desc:'Resgate de desconto', pts:-30,  data:'15/06' }
  ];
  // Reseta UI
  document.getElementById('perfilNome').textContent = 'Meu Perfil';
  document.getElementById('perfilSub').textContent  = 'Tutor PetAmigo';
  document.getElementById('statAg').textContent     = '2';
  document.getElementById('statPts').textContent    = '150';
  document.getElementById('statPets').textContent   = '2';
  document.getElementById('cartCount').textContent  = '0';
  document.getElementById('cartTotal').textContent  = 'R$ 0,00';
  document.getElementById('cartBadge').style.display = 'none';
  document.getElementById('menuPontosSub').textContent = '150 pontos disponíveis';
  document.getElementById('menuNotifSub').textContent  = 'Tudo em dia';
  document.getElementById('menuEndSub').textContent    = 'Rua das Flores, 142';
  document.getElementById('menuPetsSub').textContent   = 'Rex, Luna';
  ['inTutor','inPet','inTel'].forEach(function(id) { document.getElementById(id).value = ''; });
  document.getElementById('inAnimal').value = '';
  atualizarAgenda();
  notifNaoLidas = 0; atualizarBadgeNotif();
  navTo('Home');
}
