import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: 5,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
  },
  tableRowHeader: {
    backgroundColor: '#F3F4F6',
  },
  tableCol: {
    padding: 5,
  },
  tableCell: {
    fontSize: 10,
    textAlign: 'left',
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopStyle: 'solid',
    paddingTop: 5,
  },
  date: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 5,
  },
  meta: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 15,
  },
});

// Función para obtener descripciones legibles de los periodos
const obtenerDescripcionPeriodo = (periodo) => {
  switch (periodo) {
    case '24h': return 'últimas 24 horas';
    case '5d': return 'últimos 5 días';
    case '15d': return 'últimos 15 días';
    case '1m': return 'último mes';
    case '6m': return 'últimos 6 meses';
    case '1y': return 'último año';
    default: return periodo;
  }
};

// Función para obtener descripciones legibles de los tipos de informe
const obtenerDescripcionTipo = (tipo) => {
  switch (tipo) {
    case 'equipos': return 'Ranking de equipos más solicitados';
    case 'usuarios': return 'Ranking de usuarios con más solicitudes';
    case 'completo': return 'Informe completo (equipos y usuarios)';
    default: return tipo;
  }
};

// Componente principal del PDF
const InformePDF = ({ reportData, periodo, tipoInforme }) => {
  const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado del informe */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Informe de Inventario</Text>
            <Text style={styles.subtitle}>Sistema de Inventario UNPHU</Text>
            <Text style={styles.date}>Generado el: {fechaGeneracion}</Text>
            <Text style={styles.meta}>
              Periodo: {obtenerDescripcionPeriodo(periodo)} | 
              Tipo: {obtenerDescripcionTipo(tipoInforme)}
            </Text>
          </View>
        </View>
        
        {/* Sección de Equipos más solicitados */}
        {(tipoInforme === 'equipos' || tipoInforme === 'completo') && reportData.equipos && reportData.equipos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipos más solicitados</Text>
            <View style={styles.table}>
              {/* Encabezado de la tabla */}
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                <View style={[styles.tableCol, { width: '10%' }]}>
                  <Text style={styles.tableCellHeader}>Posición</Text>
                </View>
                <View style={[styles.tableCol, { width: '40%' }]}>
                  <Text style={styles.tableCellHeader}>Equipo</Text>
                </View>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text style={styles.tableCellHeader}>Departamento</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.tableCellHeader}>Total Solicitudes</Text>
                </View>
              </View>
              
              {/* Filas de datos */}
              {reportData.equipos.map((item, index) => (
                <View key={`equipo-${item.id}`} style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '10%' }]}>
                    <Text style={styles.tableCell}>{index + 1}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '40%' }]}>
                    <Text style={styles.tableCell}>{item.nombre}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '30%' }]}>
                    <Text style={styles.tableCell}>{item.departamento_nombre}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '20%' }]}>
                    <Text style={styles.tableCell}>{item.total_solicitudes}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Sección de Usuarios con más solicitudes */}
        {(tipoInforme === 'usuarios' || tipoInforme === 'completo') && reportData.usuarios && reportData.usuarios.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usuarios con más solicitudes</Text>
            <View style={styles.table}>
              {/* Encabezado de la tabla */}
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                <View style={[styles.tableCol, { width: '10%' }]}>
                  <Text style={styles.tableCellHeader}>Posición</Text>
                </View>
                <View style={[styles.tableCol, { width: '40%' }]}>
                  <Text style={styles.tableCellHeader}>Usuario</Text>
                </View>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text style={styles.tableCellHeader}>Matrícula</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.tableCellHeader}>Total Solicitudes</Text>
                </View>
              </View>
              
              {/* Filas de datos */}
              {reportData.usuarios.map((usuario, index) => (
                <View key={`usuario-${usuario.id}`} style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '10%' }]}>
                    <Text style={styles.tableCell}>{index + 1}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '40%' }]}>
                    <Text style={styles.tableCell}>{`${usuario.nombre} ${usuario.apellido}`}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '30%' }]}>
                    <Text style={styles.tableCell}>{usuario.matricula}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '20%' }]}>
                    <Text style={styles.tableCell}>{usuario.total_solicitudes}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Pie de página */}
        <View style={styles.footer}>
          <Text>© {new Date().getFullYear()} Sistema de Inventario UNPHU - Documento generado automáticamente</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InformePDF;