#!/usr/bin/env python3
"""Testes do app no Chrome com tela de celular. Usa só dados inventados.
Uso: python3 tests/test_app.py [nome_do_teste ...]
Requer: pip install playwright  (e um Chrome; caminho em CHROME, padrão /usr/bin/google-chrome)"""
import contextlib, json, os, pathlib, subprocess, sys, time
from playwright.sync_api import sync_playwright

ROOT = str(pathlib.Path(__file__).resolve().parent.parent)
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
KEY = 'faturas_casasbahia_v1'
NOW = '2026-11-10T10:00:00'
FAILS = []

def check(cond, msg):
    if not cond:
        FAILS.append(msg); print('   FALHOU:', msg)

def close(a, b): return abs(a - b) < 0.005

@contextlib.contextmanager
def app(now=NOW, port=8811, sw='block', dark=False):
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '-d', ROOT], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.7)
    try:
        with sync_playwright() as pw:
            b = pw.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
            ctx = b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True, service_workers=sw, color_scheme='dark' if dark else 'light')
            pg = ctx.new_page(); pg.errs = []
            pg.on('pageerror', lambda e: pg.errs.append(str(e)))
            pg.on('console', lambda m: pg.errs.append(m.text) if m.type == 'error' else None)
            if now: pg.clock.set_fixed_time(now)
            pg.goto('http://localhost:%d/' % port); pg.wait_for_timeout(300)
            yield pg
            check(not pg.errs, 'erros de JavaScript: %s' % pg.errs)
            b.close()
    finally:
        srv.kill()

def seed(pg, st):
    pg.evaluate("([k,s])=>localStorage.setItem(k,JSON.stringify(s))", [KEY, st]); pg.reload(); pg.wait_for_timeout(300)
def state(pg): return json.loads(pg.evaluate("k=>localStorage.getItem(k)", KEY))
def text(pg, sel='#view'): return pg.inner_text(sel)
def tab(pg, t): pg.click('.tabs [data-tab=%s]' % t); pg.wait_for_timeout(120)

def entry(pg, value, desc='', kind='out', pay=None, date=None, rep=None, n=None, parcelas=None, done=None, auto=False, cat=None, save=True):
    pg.click('.plus'); pg.wait_for_selector('#eV')
    if kind == 'in': pg.click('#eKind [data-k=in]')
    if pay: pg.click('#ePay [data-p="%s"]' % pay)
    pg.fill('#eV', value)
    if desc: pg.fill('#eD', desc)
    if date: pg.fill('#eDt', date)
    if parcelas: pg.fill('#eT', str(parcelas))
    if rep: pg.click('#eRep [data-r=%s]' % rep)
    if n: pg.fill('#eN', str(n))
    if cat: pg.click('#eCat [data-c="%s"]' % cat)
    if done is not None and (pg.get_attribute('#eDone', 'aria-checked') == 'true') != done: pg.click('#eDone')
    if auto: pg.click('#eAuto')
    if save: pg.click('#eSave'); pg.wait_for_timeout(150)

def old_v5():
    return {"v": 5, "start": "2026-11", "paid": {"c1:2026-11": True},
        "cards": [{"id": "c1", "name": "Cartão Teste", "last4": "1234", "limit": 5000, "adj": 50, "closing": 6, "due": 20, "goal": 1500, "cg": {"alim": 300}}],
        "items": [
            {"id": "a1", "c": "c1", "d": "IFD*LANCHE", "v": 20, "t": 4, "f": "2026-10", "dt": "2026-09-20", "cat": "alim"},
            {"id": "a2", "c": "c1", "d": "PICPAY*FULANO", "v": 50, "t": 3, "f": "2026-11", "dt": "2026-10-10", "cat": "outros"},
            {"id": "a3", "c": "c1", "d": "ANUIDADE", "v": 25, "t": 12, "f": "2026-11", "dt": "2026-11-05", "cat": "serv"},
            {"id": "a4", "c": "c1", "d": "Loja X", "v": 100.10, "t": 1, "f": "2026-12", "dt": "2026-11-08", "cat": "compras"}]}

# ------------------------------------------------------------------ migração
def t_migra_v5():
    with app() as pg:
        raw = old_v5(); seed(pg, raw); s = state(pg)
        check(s['v'] == 6, 'versão vira 6')
        check(len(s['items']) == 4 and len(s['cards']) == 1, 'itens e cartão preservados')
        check(s['paid'] == {'c1:2026-11': True}, 'fatura paga preservada')
        c = s['cards'][0]
        check(c['limit'] == 5000 and c['adj'] == 50 and c['goal'] == 1500 and c['closing'] == 6 and c['due'] == 20, 'dados do cartão preservados')
        check(s['bud'] == {'alim': 300}, 'meta por categoria vira orçamento: %s' % s['bud'])
        cats = {i['id']: i['cat'] for i in s['items']}
        check(cats == {'a1': 'alim', 'a2': 'pix', 'a3': 'fin', 'a4': 'compras'}, 'categorias reavaliadas: %s' % cats)
        check(s['set']['news'] is True and 'O app mudou' in text(pg), 'aviso de novidades aparece uma vez para quem já usava')
        pg.click('[data-act=newsOk]'); pg.wait_for_timeout(100); check('O app mudou' not in text(pg) and state(pg)['set']['news'] is False, 'aviso some ao tocar em Entendi')
        s = state(pg)
        pre = pg.evaluate("localStorage.getItem('faturas_copia_antes_v6')")
        check(pre and json.loads(pre) == raw, 'cópia de antes da atualização guardada intacta')
        tab(pg, 'cards'); t = text(pg)
        check('R$ 4.434,90' in t, 'disponível = 5000 − 515,10 − 50 → 4.434,90')
        check('dez/26' in t and 'R$ 195,10' in t, 'abre a primeira fatura em aberto (dez) com R$ 195,10')
        pg.reload(); pg.wait_for_timeout(200)
        check(state(pg) == s, 'recarregar não altera o estado')

def t_migra_legado():
    with app() as pg:
        seed(pg, {"start": "2026-11", "closing": 10, "due": 25, "paid": {"2026-11": True},
                  "items": [{"d": "Compra antiga", "v": 10, "t": 2, "f": "2026-11", "dt": "2026-11-01"}]})
        s = state(pg)
        check(len(s['cards']) == 1 and s['cards'][0]['closing'] == 10 and s['cards'][0]['due'] == 25, 'formato v1 ganha um cartão padrão')
        check(s['items'][0]['c'] == s['cards'][0]['id'] and s['paid'] == {s['cards'][0]['id'] + ':2026-11': True}, 'itens e pago ligados ao cartão')

def t_ilegivel():
    with app() as pg:
        pg.evaluate("k=>localStorage.setItem(k,'{isto não é json')", KEY); pg.reload(); pg.wait_for_timeout(200)
        check('Por onde começar' in text(pg), 'dado ilegível: abre vazio em vez de quebrar')
        keys = pg.evaluate("Object.keys(localStorage)")
        check(any(k.startswith('faturas_ilegivel_') for k in keys), 'conteúdo ilegível fica guardado à parte')
        check(pg.evaluate("k=>localStorage.getItem(k)", KEY) == '{isto não é json', 'não sobrescreve antes de o usuário lançar algo')

# ------------------------------------------------------------------ cartão
def new_card(pg, name='Cartão A', limit='500000', closing=6, due=20, goal=None):
    pg.fill('#cN', name); pg.fill('#cLim', limit); pg.fill('#cCl', str(closing)); pg.fill('#cDu', str(due))
    if goal: pg.fill('#cGoal', goal)
    pg.click('#cSave'); pg.wait_for_timeout(150)

def t_cartao_parcelas():
    with app() as pg:
        pg.click('[data-act=cardNew]'); new_card(pg)
        s = state(pg); cid = s['cards'][0]['id']
        check(s['start'] == '2026-11' and s['cards'][0]['limit'] == 5000, 'cartão criado')
        entry(pg, '10000', 'Tênis', pay=cid, parcelas=3, save=False)
        h = text(pg, '#eHint')
        check('1ª parcela de R$ 33,34 e 2 de R$ 33,33' in h and 'dez/26 a fev/27' in h and 'sobram R$ 4.900,00' in h, 'dica do parcelamento: %s' % h)
        check(text(pg, '#eVL') == 'Valor total da compra', 'rótulo do valor total')
        pg.click('#eSave'); pg.wait_for_timeout(150)
        it = state(pg)['items'][0]
        check(it['v'] == 33.33 and it.get('v1') == 33.34 and it['t'] == 3 and it['f'] == '2026-12', 'parcelas com centavos na 1ª: %s' % it)
        tab(pg, 'cards'); t = text(pg)
        check('R$ 4.900,00' in t, 'limite consome o total da compra')
        check('R$ 33,34' in t and 'dez/26' in t, 'fatura de dez mostra a 1ª parcela')
        pg.click('#mchips [data-m="2027-01"]'); check('R$ 33,33' in text(pg), 'jan mostra parcela normal')
        # editar: o campo volta com o total exato
        pg.click('#clist .row-main'); pg.wait_for_selector('#eV')
        check(pg.input_value('#eV') == '100,00' and pg.input_value('#eT') == '3', 'edição mostra o total 100,00')
        pg.fill('#eV', '9000'); pg.fill('#eT', '2'); pg.click('#eSave'); pg.wait_for_timeout(150)
        it = state(pg)['items'][0]
        check(it['v'] == 45 and 'v1' not in it and it['t'] == 2, 'edição recalcula parcelas: %s' % it)
        # marcar paga devolve o limite daquela fatura
        pg.click('#mchips [data-m="2026-12"]'); pg.click('[data-act=paid]'); pg.wait_for_timeout(100)
        check('R$ 4.955,00' in text(pg), 'fatura paga devolve o limite')
        # excluir a compra
        pg.click('#clist .row-main'); pg.wait_for_selector('#eDel'); pg.click('#eDel'); pg.click('#eDel'); pg.wait_for_timeout(150)
        check(state(pg)['items'] == [], 'compra excluída com dois toques')

def t_cartao_vencimento_antes_do_fechamento():
    with app() as pg:
        pg.click('[data-act=cardNew]'); new_card(pg, closing=28, due=5)
        cid = state(pg)['cards'][0]['id']
        entry(pg, '5000', 'Compra', pay=cid)
        check(state(pg)['items'][0]['f'] == '2026-12', 'fecha 28/11 e vence 05/12: cai na fatura de dez')
        entry(pg, '5000', 'No dia do fechamento', pay=cid, date='2026-11-28')
        check(state(pg)['items'][1]['f'] == '2027-01', 'compra no dia do fechamento (28/11) cai na fatura que vence em jan')

def t_cartao_dia_do_fechamento():
    with app() as pg:
        pg.click('[data-act=cardNew]'); new_card(pg, closing=6, due=20)
        cid = state(pg)['cards'][0]['id']
        entry(pg, '1000', 'Véspera', pay=cid, date='2026-12-05')
        entry(pg, '1000', 'No fechamento', pay=cid, date='2026-12-06')
        fs = [i['f'] for i in state(pg)['items']]
        check(fs == ['2026-12', '2027-01'], 'dia 5 entra na fatura do mês, dia 6 (fechamento) na seguinte: %s' % fs)
        # o usuário pode escolher outra fatura à mão
        entry(pg, '1000', 'Escolhida', pay=cid, date='2026-12-05', save=False)
        pg.select_option('#eF', '2027-03'); pg.click('#eSave'); pg.wait_for_timeout(150)
        check(state(pg)['items'][2]['f'] == '2027-03', 'fatura escolhida à mão é respeitada')

def t_cartao_excluir():
    with app() as pg:
        seed(pg, old_v5()); tab(pg, 'cards')
        pg.click('[data-act=cardEdit]'); pg.wait_for_selector('#cDel'); pg.click('#cDel'); pg.click('#cDel'); pg.wait_for_timeout(150)
        s = state(pg)
        check(s['cards'] == [] and s['items'] == [] and s['paid'] == {}, 'excluir cartão leva compras e pagos')
        check('Nenhum cartão cadastrado' in text(pg), 'tela de cartões vazia')
        tab(pg, 'home'); check('Por onde começar' in text(pg), 'sem dados volta às boas-vindas')

# ------------------------------------------------------------------ carteira
def t_carteira_basico():
    with app() as pg:
        entry(pg, '520000', 'Salário', kind='in', date='2026-11-05', rep='mo')
        entry(pg, '140000', 'Aluguel', date='2026-11-15', rep='mo')
        entry(pg, '23050', 'Supermercado')
        entry(pg, '19990', 'Curso de inglês', date='2026-11-25', rep='n', n=6)
        s = state(pg)
        check(len(s['tx']) == 1 and s['tx'][0]['done'] is True and s['tx'][0]['cat'] == 'mercado', 'avulsa de hoje nasce paga e categorizada')
        recs = {r['d']: r for r in s['rec']}
        check(recs['Salário']['k'] == 'in' and recs['Salário']['day'] == 5 and recs['Salário']['to'] is None and recs['Salário']['cat'] == 'sal', 'receita mensal')
        check(recs['Aluguel']['cat'] == 'casa' and recs['Curso de inglês']['to'] == '2027-04' and recs['Curso de inglês']['cat'] == 'educ', 'recorrentes e categorias')
        check(s['ov'] == {recs['Salário']['id'] + ':2026-11': {'done': 1}}, 'salário de 05/11 já recebido; aluguel futuro pendente')
        t = text(pg)
        check('R$ 5.200,00' in t and 'R$ 1.830,40' in t and 'Sobra em novembro' in t and 'R$ 3.369,60' in t and 'no azul' in t, 'conta do mês: %s' % t[:200])
        check('Falta pagar em novembro' in t and 'R$ 1.599,90' in t, 'falta pagar soma pendentes')
        tab(pg, 'wallet'); t = text(pg)
        check('Recebido R$ 5.200,00' in t and 'Pago R$ 230,50' in t, 'resumo da carteira')
        check('1 de 6' in t and 'todo mês' in t and 'vence em 5 dias' in t, 'marcas de recorrência e vencimento')
        # mês seguinte: só o que repete
        pg.click('[data-act=month][data-d="1"]'); pg.wait_for_timeout(100); t = text(pg)
        check('Supermercado' not in t and 'Aluguel' in t and '2 de 6' in t and 'Recebido R$ 0,00' in t, 'dezembro traz só os recorrentes, pendentes')
        check(pg.is_visible('.nowchip'), 'botão Hoje aparece fora do mês atual')
        pg.click('.nowchip'); check('Supermercado' in text(pg), 'Hoje volta para novembro')
        # filtros e busca
        pg.click('[data-act=wf][data-v=pend]'); t = text(pg, '#wlist'); check('Aluguel' in t and 'Salário' not in t, 'filtro pendentes')
        pg.click('[data-act=wf][data-v=in]'); t = text(pg, '#wlist'); check('Salário' in t and 'Aluguel' not in t, 'filtro receitas')

def t_marcar_pago_e_saldo():
    with app() as pg:
        st = old_v5(); st['paid'] = {}; seed(pg, st)
        entry(pg, '300000', 'Salário', kind='in', date='2026-11-05')        # recebido
        entry(pg, '50000', 'Conta de luz', date='2026-11-18')              # pendente
        # saldo informado: 1.000
        pg.click('[data-act=pg][data-p=balance]'); pg.fill('#sV', '100000'); pg.click('#sSave'); pg.wait_for_timeout(150)
        s = state(pg); check(close(s['open'], 1000 - 3000), 'abertura = saldo − já realizado (%s)' % s['open'])
        t = text(pg); check('Hoje\nR$ 1.000,00' in t.replace('\n\n', '\n'), 'saldo de hoje aparece')
        # previsto fim de nov: 1000 − 500 (luz) − 95 (fatura nov)
        check('R$ 405,00' in t, 'previsão do fim do mês = saldo − pendências: %s' % t[t.find('Saldo em conta'):][:160])
        # pagar a luz pelo círculo
        pg.click('.tick[aria-label*="Conta de luz"]'); pg.wait_for_timeout(120)
        check(state(pg)['tx'][1]['done'] is True, 'toque no círculo marca pago')
        t = text(pg); check('R$ 500,00' in t and 'R$ 405,00' in t, 'saldo cai para 500 e a previsão continua 405')
        # pagar a fatura pela lista
        pg.click('.tick[aria-label*="Fatura"]'); pg.wait_for_timeout(120)
        s = state(pg); check(s['paid'] == {'c1:2026-11': True}, 'fatura marcada como paga')
        t = text(pg); check('Tudo pago em novembro' in t and t.count('R$ 405,00') >= 2, 'tudo pago; saldo 405')
        # desmarcar devolve
        tab(pg, 'wallet'); pg.click('.tick[aria-label*="Fatura"]'); pg.wait_for_timeout(120)
        check(state(pg)['paid'] == {}, 'desmarcar reabre a fatura')
        # projeção com saldo: fim de dez = 500 − 95 − 195,10
        tab(pg, 'stats'); pg.click('[data-act=aseg][data-v=proj]'); t = text(pg)
        check('Saldo previsto em conta' in t, 'projeção usa o saldo')
        row = [l for l in t.split('\n') if l.startswith('dez/26')]
        check(row and row[0].split('\t')[-1].strip() == '210', 'saldo no fim de dez = 210 (linha: %s)' % row)

def t_recorrente_escopos():
    with app() as pg:
        entry(pg, '10000', 'Academia', date='2026-11-12', rep='mo')
        rid = state(pg)['rec'][0]['id']
        tab(pg, 'wallet')
        # só neste mês: valor diferente em novembro
        pg.click('#wlist .row-main'); pg.wait_for_selector('#eScope')
        check(pg.get_attribute('#eScope [data-s=one]', 'aria-pressed') == 'true', 'padrão: só neste mês')
        pg.fill('#eV', '12000'); pg.click('#eSave'); pg.wait_for_timeout(150)
        s = state(pg); check(s['rec'][0]['v'] == 100 and s['ov'][rid + ':2026-11'].get('v') == 120, 'ajuste só de novembro')
        pg.click('[data-act=month][data-d="1"]'); check('R$ 100,00' in text(pg, '#wlist'), 'dezembro continua 100')
        # deste mês em diante (a partir de jan): divide a série
        pg.click('[data-act=month][data-d="1"]'); pg.click('#wlist .row-main'); pg.wait_for_selector('#eScope')
        pg.click('#eScope [data-s=next]'); pg.fill('#eV', '15000'); pg.fill('#eDt', '2027-01-20'); pg.click('#eSave'); pg.wait_for_timeout(150)
        s = state(pg); recs = sorted(s['rec'], key=lambda r: r['from'])
        check(len(recs) == 2 and recs[0]['to'] == '2026-12' and recs[1]['from'] == '2027-01' and recs[1]['v'] == 150 and recs[1]['day'] == 20 and recs[1]['to'] is None, 'série dividida em jan: %s' % recs)
        check('R$ 150,00' in text(pg, '#wlist') and '20' in text(pg, '#wlist'), 'jan mostra 150 no dia 20')
        pg.click('[data-act=month][data-d="1"]'); check('R$ 150,00' in text(pg, '#wlist'), 'fev segue a nova série')
        # excluir só fevereiro
        pg.click('#wlist .row-main'); pg.wait_for_selector('#eDel'); pg.click('#eDel')
        check('só fevereiro' in text(pg, '#eDel'), 'confirmação diz o alcance: %s' % text(pg, '#eDel'))
        pg.click('#eDel'); pg.wait_for_timeout(150)
        check('Nada lançado em fevereiro' in text(pg), 'fevereiro pulado')
        pg.click('[data-act=month][data-d="1"]'); check('R$ 150,00' in text(pg, '#wlist'), 'março continua')
        # excluir de março em diante
        pg.click('#wlist .row-main'); pg.wait_for_selector('#eScope'); pg.click('#eScope [data-s=next]'); pg.click('#eDel')
        check('de março em diante' in text(pg, '#eDel'), 'confirmação: %s' % text(pg, '#eDel'))
        pg.click('#eDel'); pg.wait_for_timeout(150)
        recs = sorted(state(pg)['rec'], key=lambda r: r['from'])
        check(recs[1]['to'] == '2027-02', 'série encerrada em fev')
        pg.click('[data-act=month][data-d="1"]'); check('Nada lançado em abril' in text(pg), 'abril vazio')
        # pela lista de recorrentes: as duas séries aparecem; a que já acabou vai para Encerradas
        pg.click('[data-act=settings]'); pg.click('[data-p=recur]'); t = text(pg, '#page')
        check('Encerradas' not in t and t.count('Academia') == 2, 'ajustes lista as duas séries como ativas: %s' % t)
        pg.clock.set_fixed_time('2027-01-15T10:00:00'); pg.reload(); pg.wait_for_timeout(200)
        pg.click('[data-act=settings]'); pg.click('[data-p=recur]'); t = text(pg, '#page')
        check('Encerradas' in t and 'de nov/26 a dez/26' in t, 'em janeiro a primeira série aparece como encerrada: %s' % t)
        pg.click('#page .grp .set-row'); pg.wait_for_selector('#eScope')
        check(pg.get_attribute('#eScope [data-s=next]', 'aria-pressed') == 'true' and pg.input_value('#eDt').startswith('2026-12'), 'abre na última ocorrência, valendo dali em diante')

def t_recorrente_automatico():
    with app() as pg:
        entry(pg, '8000', 'Internet', date='2026-10-08', rep='mo', auto=True, done=False)
        s = state(pg); rid = s['rec'][0]['id']
        check(s['rec'][0]['auto'] is True and s['ov'] == {rid + ':2026-10': {'done': 0}}, 'automático, mas outubro ficou explícito como pendente: %s' % s['ov'])
        t = text(pg)
        check('venceu há 33 dias' in t and 'Falta pagar em novembro' in t and 'R$ 80,00' in t, 'pendência de outubro aparece atrasada em novembro: %s' % t[:300])
        tab(pg, 'wallet'); t = text(pg, '#wlist')
        check('Internet' in t and pg.get_attribute('#wlist .tick', 'aria-pressed') == 'true', 'novembro (dia 8, já passou) marcado sozinho')
        pg.click('[data-act=month][data-d="1"]'); check(pg.get_attribute('#wlist .tick', 'aria-pressed') == 'false', 'dezembro ainda pendente')

# ------------------------------------------------------------------ análise
def t_orcamento_e_categorias():
    with app() as pg:
        seed(pg, old_v5())          # nov: alim 20, pix 50, fin 25 (fatura paga)
        entry(pg, '45000', 'Mercado do mês', cat='mercado')
        tab(pg, 'stats'); t = text(pg)
        check('R$ 545,00' in t, 'gastos = carteira 450 + fatura 95')
        check('Orçamento R$ 300,00: ainda cabem R$ 280,00' in t, 'orçamento migrado aparece em alimentação')
        pg.click('[data-act=pg][data-p=budget]'); pg.fill('#bTot', '50000'); pg.fill('#b_mercado', '40000'); pg.click('#bSave'); pg.wait_for_timeout(150)
        s = state(pg); check(s['budTot'] == 500 and s['bud'] == {'alim': 300, 'mercado': 400}, 'orçamento salvo: %s' % s['bud'])
        t = text(pg); check('Teto do mês R$ 500,00: passou R$ 45,00' in t and 'Orçamento R$ 400,00: passou R$ 50,00' in t, 'estouro sinalizado')
        check(pg.locator('.rk .meter.over').count() == 1, 'barra vermelha só na categoria estourada')
        # detalhe da categoria
        pg.click('.rk[data-v=mercado]'); pg.wait_for_selector('#pbody'); t = text(pg, '#page')
        check('Mercado do mês' in t and 'Carteira' in t and 'R$ 450,00' in t, 'detalhe lista os lançamentos da categoria')
        pg.click('[data-act=back]'); pg.wait_for_timeout(100)
        pg.click('.rk[data-v=pix]'); t = text(pg, '#page'); check('PICPAY*FULANO' in t and 'Cartão Teste' in t and '1/3' in t, 'detalhe inclui compras do cartão')

def t_projecao_sem_saldo():
    with app() as pg:
        seed(pg, old_v5())
        entry(pg, '100000', 'Salário', kind='in', date='2026-11-05', rep='mo')
        tab(pg, 'stats'); pg.click('[data-act=aseg][data-v=proj]'); t = text(pg)
        rows = {l.split('\t')[0]: [c.strip() for c in l.split('\t')] for l in t.split('\n') if '/2' in l.split('\t')[0] and '\t' in l}
        check(rows['nov/26'] == ['nov/26', '1.000', '0', '95', '905', '905'], 'nov: %s' % rows.get('nov/26'))
        check(rows['dez/26'] == ['dez/26', '1.000', '0', '195', '805', '1.710'], 'dez acumula as sobras: %s' % rows.get('dez/26'))
        check('nenhum dos próximos 12 meses fecha no vermelho' in t and 'Sobra acumulada' in t, 'texto da projeção')
        pg.click('.chart g[data-m="2026-12"]'); t = text(pg)
        check('Dezembro de 2026' in t and 'sobra R$ 804,90' in t, 'toque no mês mostra o valor exato')

def t_objetivos():
    with app() as pg:
        entry(pg, '10000', 'Qualquer')      # sai das boas-vindas
        tab(pg, 'stats'); pg.click('[data-act=aseg][data-v=goals]'); pg.click('[data-act=goal]'); pg.wait_for_selector('#gN')
        pg.fill('#gN', 'Reserva'); pg.fill('#gT', '600000'); pg.fill('#gS', '100000'); pg.select_option('#gD', '2027-04'); pg.click('#gSave'); pg.wait_for_timeout(150)
        g = state(pg)['goals'][0]; check(g['n'] == 'Reserva' and g['target'] == 6000 and g['saved'] == 1000 and g['due'] == '2027-04', 'objetivo criado: %s' % g)
        check('Faltam R$ 5.000,00: R$ 833,33 por mês até abr/27' in text(pg), 'sugestão mensal (6 meses): %s' % text(pg)[-200:])
        pg.click('.rk[data-act=goal]'); pg.wait_for_selector('#gAmt'); pg.fill('#gAmt', '50000'); pg.click('#gAdd'); pg.wait_for_timeout(150)
        s = state(pg); check(s['goals'][0]['saved'] == 1500, 'guardar soma no objetivo')
        tx = s['tx'][-1]; check(tx['cat'] == 'reserva' and tx['v'] == 500 and tx['done'] is True and tx['k'] == 'out', 'guardar lança despesa de reserva: %s' % tx)
        pg.click('.rk[data-act=goal]'); pg.fill('#gAmt', '999900'); pg.click('#gSub')
        check('Só há' in text(pg, '#gErr2'), 'não retira mais do que tem')

def t_categoria_propria():
    with app() as pg:
        pg.click('[data-act=settings]'); pg.click('[data-p=cats]'); pg.fill('#kN', 'Pets'); pg.click('#kAdd'); pg.wait_for_timeout(150)
        cid = state(pg)['cats'][0]['id']
        pg.fill('#kN', 'pets'); pg.click('#kAdd'); check('Já existe' in text(pg, '#kErr'), 'não duplica nome')
        pg.click('[data-act=back]'); pg.click('[data-act=back]'); pg.wait_for_timeout(100)
        entry(pg, '9000', 'Ração', cat=cid)
        check(state(pg)['tx'][0]['cat'] == cid, 'lançamento usa a categoria criada')
        tab(pg, 'stats'); check('Pets' in text(pg), 'categoria aparece na análise')
        pg.click('[data-act=settings]'); pg.click('[data-p=cats]'); pg.click('[data-del]'); pg.click('[data-del]'); pg.wait_for_timeout(150)
        pg.click('[data-act=back]'); pg.click('[data-act=back]'); pg.wait_for_timeout(100)
        check(state(pg)['cats'] == [] and 'Outros' in text(pg) and 'Pets' not in text(pg), 'excluída: lançamento cai em Outros')

# ------------------------------------------------------------------ dados
def t_backup_restauracao():
    with app() as pg:
        seed(pg, old_v5()); entry(pg, '10000', 'Teste'); before = state(pg)
        pg.click('[data-act=settings]'); pg.click('[data-p=data]'); pg.click('#dShow')
        bk = pg.input_value('#dOut'); data = json.loads(bk)
        check(data['app'] == 'faturas' and data['state']['items'] == before['items'], 'texto do backup contém o estado')
        pg.click('#dReset'); pg.click('#dReset'); pg.wait_for_timeout(150)
        check(state(pg)['items'] == [] and 'Por onde começar' in text(pg), 'apagar tudo zera e volta ao início')
        pg.click('[data-act=pg][data-p=data]'); pg.fill('#dPaste', 'lixo'); pg.click('#dRestore')
        check('não é um backup válido' in text(pg, '#dErr') and text(pg, '#dRestore') == 'Restaurar', 'backup inválido é recusado')
        pg.fill('#dPaste', bk); pg.click('#dRestore'); check('5 lançamentos' in text(pg, '#dRestore'), 'confirmação conta os lançamentos: %s' % text(pg, '#dRestore'))
        pg.click('#dRestore'); pg.wait_for_timeout(150)
        after = state(pg)
        check(after['items'] == before['items'] and after['tx'] == before['tx'] and after['cards'] == before['cards'], 'restauração devolve os dados')
        # backup no formato antigo (v1 do arquivo, estado v4/v5) também entra
        pg.click('[data-act=settings]'); pg.click('[data-p=data]')
        pg.fill('#dPaste', json.dumps({"app": "faturas", "v": 1, "state": old_v5()})); pg.click('#dRestore'); pg.click('#dRestore'); pg.wait_for_timeout(150)
        check(len(state(pg)['items']) == 4 and state(pg)['tx'] == [], 'backup antigo é convertido ao restaurar')
        # planilha
        csv = pg.evaluate("()=>new Promise(r=>{const o=URL.createObjectURL;let got=null;URL.createObjectURL=b=>{b.text().then(t=>r(t));return o.call(URL,b)};document.querySelector('[data-act=settings]').click();document.querySelector('[data-p=data]').click();document.querySelector('#dCsvW').click();})")
        check('Data;Descrição;Categoria;Tipo;Valor;Situação' in csv and 'Fatura do cartão' in csv, 'CSV da carteira: %s' % csv[:120])

def t_ocultar_tema_xss():
    with app() as pg:
        seed(pg, old_v5())
        entry(pg, '1234', '<img src=x onerror="window.__x=1"><b>negrito</b>')
        tab(pg, 'wallet')
        check(pg.evaluate("window.__x") is None and pg.locator('#view img').count() == 0 and '<b>negrito</b>' in text(pg), 'descrição com HTML aparece como texto')
        tab(pg, 'home')
        pg.click('[data-act=hide]'); t = text(pg)
        check('R$ •••' in t and 'R$ 12,34' not in t, 'ocultar valores')
        check(state(pg)['set']['hide'] is True, 'preferência salva')
        pg.click('[data-act=hide]')
        pg.click('[data-act=settings]'); pg.click('[data-act=theme][data-v=dark]'); pg.wait_for_timeout(100)
        check(pg.evaluate("document.documentElement.getAttribute('data-theme')") == 'dark' and state(pg)['set']['theme'] == 'dark', 'tema escuro aplicado e salvo')
        bg = pg.evaluate("getComputedStyle(document.body).backgroundColor"); check(bg == 'rgb(14, 20, 36)', 'fundo escuro: %s' % bg)
        pg.reload(); pg.wait_for_timeout(200); check(pg.evaluate("document.documentElement.getAttribute('data-theme')") == 'dark', 'tema continua após recarregar')

def t_voltar():
    with app() as pg:
        seed(pg, old_v5())
        pg.click('[data-act=settings]'); pg.click('[data-p=budget]'); pg.wait_for_selector('#bTot')
        pg.go_back(); pg.wait_for_timeout(150); check('Saldo em conta' in text(pg, '#page') and pg.locator('#bTot').count() == 0, 'voltar do navegador fecha só a página de cima')
        pg.go_back(); pg.wait_for_timeout(150); check(pg.is_hidden('#page') and pg.is_visible('#tabs'), 'segundo voltar retorna ao app')
        pg.click('.plus'); pg.wait_for_selector('#eV'); pg.fill('#eV', '5000'); pg.go_back(); pg.wait_for_timeout(150)
        check(pg.is_hidden('#page') and state(pg)['tx'] == [], 'voltar no formulário descarta sem salvar')
        pg.click('.plus'); pg.wait_for_selector('#eV'); pg.fill('#eV', '5000'); pg.click('#eSave'); pg.wait_for_timeout(200)
        pg.click('.plus'); pg.wait_for_selector('#eV'); check(pg.is_visible('#eV'), 'abrir de novo logo após salvar funciona')
        pg.click('[data-act=back]'); pg.wait_for_timeout(150); check(pg.is_hidden('#page') and len(state(pg)['tx']) == 1, 'botão voltar fecha')
        # validação
        pg.click('.plus'); pg.click('#eSave'); check('Informe o valor' in text(pg, '#eErr'), 'sem valor não salva')

def t_offline():
    with app(now=None, sw='allow', port=8812) as pg:
        pg.wait_for_function("navigator.serviceWorker.controller!==null || navigator.serviceWorker.ready.then(()=>true)", timeout=8000)
        pg.wait_for_timeout(1200); pg.reload(); pg.wait_for_timeout(600)
        check(pg.evaluate("!!navigator.serviceWorker.controller"), 'service worker assume a página')
        pg.context.set_offline(True); pg.reload(); pg.wait_for_timeout(600)
        check('Por onde começar' in text(pg), 'abre sem internet')
        pg.context.set_offline(False)

TESTS = [t_migra_v5, t_migra_legado, t_ilegivel, t_cartao_parcelas, t_cartao_vencimento_antes_do_fechamento, t_cartao_dia_do_fechamento, t_cartao_excluir,
         t_carteira_basico, t_marcar_pago_e_saldo, t_recorrente_escopos, t_recorrente_automatico, t_orcamento_e_categorias,
         t_projecao_sem_saldo, t_objetivos, t_categoria_propria, t_backup_restauracao, t_ocultar_tema_xss, t_voltar, t_offline]

if __name__ == '__main__':
    want = sys.argv[1:]
    for t in TESTS:
        if want and t.__name__ not in want: continue
        n0 = len(FAILS); print(t.__name__, '...', flush=True)
        try: t()
        except Exception as e:
            FAILS.append('%s: exceção %r' % (t.__name__, e)); print('   EXCEÇÃO:', repr(e)[:400])
        print('   ok' if len(FAILS) == n0 else '   %d falha(s)' % (len(FAILS) - n0))
    print('\n%d falha(s)' % len(FAILS)); sys.exit(1 if FAILS else 0)
