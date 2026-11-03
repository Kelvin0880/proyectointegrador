'use client';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download, LoaderCircle } from 'lucide-react';
import { InformePDF } from './InformePDF';

/** Botón que genera y descarga el informe en PDF (se carga solo en el navegador) */
export default function PdfDownloadButton({ data }) {
  const fecha = new Date().toISOString().slice(0, 10);
  return (
    <PDFDownloadLink
      document={<InformePDF data={data} />}
      fileName={`informe-unphu-${data.meta.periodo}-${fecha}.pdf`}
      className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-800"
    >
      {({ loading }) =>
        loading ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Generando PDF...
          </>
        ) : (
          <>
            <Download className="size-4" aria-hidden="true" />
            Descargar PDF
          </>
        )
      }
    </PDFDownloadLink>
  );
}
