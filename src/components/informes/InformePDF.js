// Documento PDF del informe (generado en el navegador con @react-pdf/renderer)
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { INSTITUTION, SOLICITUD_ESTADOS, tipoInformeLabel } from '@/lib/constants';

const BRAND = '#175232';
const BRAND_BAR = '#227747';
const LOGO_SRC = typeof window !== 'undefined' ? `${window.location.origin}/logo-unphu.png` : '/logo-unphu.png';

const styles = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 56, paddingHorizontal: 40, fontSize: 10, color: '#0f172a', fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: BRAND, paddingBottom: 14, marginBottom: 18 },
  logo: { width: 54, height: 54, marginRight: 14 },
  institution: { fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: BRAND, marginTop: 2 },
  meta: { flexDirection: 'row', marginBottom: 18, gap: 10 },
  metaBox: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 4, padding: 8 },
  metaLabel: { fontSize: 7.5, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 },
  metaValue: { fontSize: 10, marginTop: 2, fontFamily: 'Helvetica-Bold' },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: BRAND, marginBottom: 8, marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  stat: { flex: 1, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, padding: 8 },
  statValue: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  table: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, marginBottom: 18 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', alignItems: 'center', minHeight: 22 },
  rowLast: { borderBottomWidth: 0 },
  headRow: { backgroundColor: '#f8fafc' },
  cell: { paddingVertical: 5, paddingHorizontal: 6 },
  headCell: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#475569', textTransform: 'uppercase' },
  barTrack: { height: 8, flexGrow: 1, marginRight: 6 },
  bar: { height: 8, backgroundColor: BRAND_BAR, borderTopRightRadius: 2, borderBottomRightRadius: 2 },
  empty: { fontSize: 10, color: '#64748b', padding: 12 },
  footer: { position: 'absolute', bottom: 24, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#94a3b8', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 6 },
});

const fmtDate = (value) =>
  new Date(value).toLocaleString('es-DO', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' });

function RankingTable({ rows, columns }) {
  const max = Math.max(1, ...rows.map((r) => r.total_solicitudes));
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.headRow]}>
        <Text style={[styles.cell, styles.headCell, { width: '7%' }]}>#</Text>
        <Text style={[styles.cell, styles.headCell, { width: '35%' }]}>{columns[0]}</Text>
        <Text style={[styles.cell, styles.headCell, { width: '25%' }]}>{columns[1]}</Text>
        <Text style={[styles.cell, styles.headCell, { width: '33%' }]}>Solicitudes</Text>
      </View>
      {rows.map((r, i) => (
        <View key={r.id} style={[styles.row, i === rows.length - 1 && styles.rowLast]} wrap={false}>
          <Text style={[styles.cell, { width: '7%', color: '#64748b' }]}>{i + 1}</Text>
          <Text style={[styles.cell, { width: '35%' }]}>{r.label}</Text>
          <Text style={[styles.cell, { width: '25%', color: '#475569' }]}>{r.sublabel}</Text>
          <View style={[styles.cell, { width: '33%', flexDirection: 'row', alignItems: 'center' }]}>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { width: `${(r.total_solicitudes / max) * 100}%` }]} />
            </View>
            <Text style={{ fontFamily: 'Helvetica-Bold', width: 22, textAlign: 'right' }}>{r.total_solicitudes}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function InformePDF({ data }) {
  const { meta, resumen } = data;
  const equipos = (data.equipos ?? []).map((e) => ({ ...e, label: e.nombre, sublabel: e.departamento_nombre }));
  const usuarios = (data.usuarios ?? []).map((u) => ({ ...u, label: `${u.nombre} ${u.apellido}`, sublabel: u.matricula }));

  return (
    <Document title={`Informe de inventario UNPHU - ${meta.periodoLabel}`} author={INSTITUTION.name}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de react-pdf no admite alt */}
          <Image src={LOGO_SRC} style={styles.logo} />
          <View>
            <Text style={styles.institution}>{INSTITUTION.name}</Text>
            <Text style={styles.title}>Informe de Inventario y Préstamos</Text>
          </View>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Periodo</Text>
            <Text style={styles.metaValue}>{meta.periodoLabel}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Tipo de informe</Text>
            <Text style={styles.metaValue}>{tipoInformeLabel(meta.tipo)}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Desde</Text>
            <Text style={styles.metaValue}>{fmtDate(meta.fechaInicio)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Resumen de solicitudes ({resumen.total})</Text>
        <View style={styles.statsRow}>
          {SOLICITUD_ESTADOS.map((estado) => (
            <View key={estado} style={styles.stat}>
              <Text style={styles.metaLabel}>{estado}s</Text>
              <Text style={styles.statValue}>{resumen.porEstado[estado]}</Text>
            </View>
          ))}
        </View>

        {(meta.tipo === 'equipos' || meta.tipo === 'completo') && (
          <View>
            <Text style={styles.sectionTitle}>Equipos más solicitados</Text>
            {equipos.length ? <RankingTable rows={equipos} columns={['Equipo', 'Departamento']} /> : <Text style={styles.empty}>Sin solicitudes de equipos en este periodo.</Text>}
          </View>
        )}

        {(meta.tipo === 'usuarios' || meta.tipo === 'completo') && (
          <View>
            <Text style={styles.sectionTitle}>Usuarios con más solicitudes</Text>
            {usuarios.length ? <RankingTable rows={usuarios} columns={['Usuario', 'Matrícula']} /> : <Text style={styles.empty}>Sin solicitudes de usuarios en este periodo.</Text>}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>Generado el {fmtDate(new Date())} · Sistema de Inventario UNPHU</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
