/**
 * Genera docs/Mona_Tatt_Template.xlsx con todas las hojas que vamos a
 * sincronizar con el backend. Este archivo se sube a Google Sheets y es la
 * fuente de verdad para reservas, clientes, tatuajes, precios y configuración.
 *
 * Correr: node scripts/generate-sheet-template.mjs
 */

import * as XLSX from "xlsx";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, "..", "docs", "Mona_Tatt_Template.xlsx");

const wb = XLSX.utils.book_new();

// ---------- 1. Instrucciones ----------
const instrucciones = [
  ["Mona Tatt · Template de Google Sheets"],
  [""],
  ["Este archivo centraliza toda la información del estudio. Cada hoja tiene un propósito específico."],
  ["No borres las columnas ni cambies el orden. El backend lee por nombre de columna."],
  [""],
  ["HOJA", "PARA QUÉ SIRVE"],
  ["Reservas", "Cada fila es una reserva del cliente. El backend escribe aquí cuando alguien completa el flujo."],
  ["Tatuajes", "Detalle de cada tatuaje. Una reserva puede tener varios. Relación por reserva_id."],
  ["Solicitudes_Especiales", "Horario fuera de agenda o tamaño especial. El cliente las dispara desde el flujo."],
  ["Precios_Lineales", "Matriz ancho × alto (1-15 cm) con precios en CLP para estilo lineal."],
  ["Precios_Realistas", "Misma matriz para estilo realista."],
  ["Horas_Lineales", "Cuánto demora cada combinación ancho × alto en estilo lineal (decimales, ej 1.5)."],
  ["Horas_Realistas", "Lo mismo para realista."],
  ["Bloqueos_Agenda", "Días o franjas bloqueadas (feriados, vacaciones, citas puntuales no por la app)."],
  ["Configuracion", "Pares clave/valor: datos bancarios, horarios, email admin, modo de abono, etc."],
  ["Correos_Log", "Log de correos enviados por el sistema (para auditoría)."],
  [""],
  ["ESTADOS DE RESERVA (columna estado en hoja Reservas):"],
  ["QUOTED", "Cotización generada, cliente aún no presiona 'Ya transferí'."],
  ["PENDING_CONFIRMATION", "Cliente avisó que transfirió, requiere tu confirmación."],
  ["CONFIRMED", "Confirmada por ti. Se envió correo al cliente."],
  ["REJECTED", "Rechazada por ti (no llegó abono, etc.)."],
  ["COMPLETED", "Sesión realizada."],
  ["CANCELLED", "Cancelada antes de la sesión."],
  ["RESCHEDULED", "Reagendada a otra fecha."],
  [""],
  ["FORMATO DE FECHAS: YYYY-MM-DD (ej. 2026-05-14)"],
  ["FORMATO DE HORAS: HH:mm (ej. 14:30, con ceros a la izquierda)"],
  ["FORMATO DE PRECIOS: número entero en CLP, sin puntos ni símbolos. Ej: 95000"],
  ["BOOLEANOS: TRUE o FALSE (en mayúsculas)"]
];
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(instrucciones), "Instrucciones");

// ---------- 2. Reservas ----------
const reservasHeaders = [
  "id",
  "creada_en",
  "estado",
  "cliente_id",
  "cliente_nombre",
  "cliente_email",
  "cliente_telefono",
  "cliente_edad",
  "cliente_genero",
  "fecha_cita",
  "hora_inicio",
  "hora_fin",
  "horas_total",
  "precio_total",
  "monto_abono",
  "abono_pagado",
  "ref_transferencia",
  "url_comprobante",
  "notas_admin",
  "pendiente_desde",
  "confirmada_en",
  "cliente_notificado_en",
  "motivo_rechazo",
  "slot_hold_hasta"
];
const reservasSample = [
  "bk_demo_001",
  "2026-04-19T14:05:00Z",
  "CONFIRMED",
  "c_demo_001",
  "Javiera Rojas",
  "javi.rojas@example.com",
  "+56 9 8765 4321",
  27,
  "femenino",
  "2026-04-22",
  "11:00",
  "13:00",
  2,
  110000,
  33000,
  "TRUE",
  "OP-9912345",
  "",
  "Cliente antigua — tercera sesión",
  "2026-04-19T14:00:00Z",
  "2026-04-19T18:30:00Z",
  "2026-04-19T18:31:00Z",
  "",
  ""
];
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet([reservasHeaders, reservasSample]),
  "Reservas"
);

// ---------- 3. Tatuajes ----------
const tatuajesHeaders = [
  "tatuaje_id",
  "reserva_id",
  "orden",
  "descripcion",
  "estilo",
  "ancho_cm",
  "alto_cm",
  "tamano_especial",
  "lugar_cuerpo",
  "color",
  "precio",
  "urls_referencias"
];
const tatuajeSample = [
  "t_demo_001",
  "bk_demo_001",
  1,
  "Rama de olivo fineline en antebrazo, sin sombra.",
  "lineal",
  10,
  10,
  "FALSE",
  "antebrazo",
  "negro",
  110000,
  "https://drive.google.com/file/d/XXXX/view"
];
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet([tatuajesHeaders, tatuajeSample]),
  "Tatuajes"
);

// ---------- 4. Solicitudes_Especiales ----------
const solicitudesHeaders = [
  "id",
  "creada_en",
  "tipo",
  "cliente_nombre",
  "cliente_email",
  "cliente_telefono",
  "detalles",
  "resuelta",
  "resuelta_en",
  "respuesta_admin"
];
const solicitudSample = [
  "sr_demo_001",
  "2026-04-18T10:15:00Z",
  "horario",
  "Paula Sánchez",
  "paula@example.com",
  "+56 9 1111 2222",
  'Prefiere sábado 15:00. Motivo: trabajo entre semana.',
  "FALSE",
  "",
  ""
];
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet([solicitudesHeaders, solicitudSample]),
  "Solicitudes_Especiales"
);

// ---------- 5 & 6. Precios matriz ----------
function buildPriceMatrix() {
  const header = ["Alto \\ Ancho", ...Array.from({ length: 15 }, (_, i) => i + 1)];
  const rows = [header];
  for (let h = 1; h <= 15; h++) {
    rows.push([h, ...Array(15).fill(null)]);
  }
  return rows;
}
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(buildPriceMatrix()), "Precios_Lineales");
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(buildPriceMatrix()), "Precios_Realistas");

// ---------- 7 & 8. Horas matriz ----------
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(buildPriceMatrix()), "Horas_Lineales");
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(buildPriceMatrix()), "Horas_Realistas");

// ---------- 9. Bloqueos_Agenda ----------
const bloqueosHeaders = [
  "id",
  "fecha",
  "hora_inicio",
  "hora_fin",
  "motivo",
  "dia_completo"
];
const bloqueoSample = [
  "blk_demo_001",
  "2026-05-01",
  "",
  "",
  "Feriado · Día del trabajador",
  "TRUE"
];
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet([bloqueosHeaders, bloqueoSample]),
  "Bloqueos_Agenda"
);

// ---------- 10. Configuracion ----------
const configHeaders = ["clave", "valor", "descripcion"];
const configRows = [
  configHeaders,
  ["admin_email", "agenda.monatatt@gmail.com", "Email principal del estudio (admin login)"],
  ["estudio_direccion", "Av. Providencia 123, Santiago", "Dirección mostrada en correos de confirmación"],
  ["instagram", "@mona.tatt", "Handle público"],
  ["horario_dias", "lun,mar,mie,jue,vie", "Días de atención separados por coma"],
  ["horario_inicio", "10:00", "Hora de inicio del día"],
  ["horario_fin", "16:00", "Hora de cierre del día"],
  ["banco_titular", "Mona Tatt SpA", "Titular de la cuenta para transferencias"],
  ["banco_rut", "77.123.456-7", ""],
  ["banco_nombre", "Banco de Chile", ""],
  ["banco_cuenta_tipo", "Cuenta Corriente", ""],
  ["banco_cuenta_numero", "0012345678", ""],
  ["banco_email_comprobante", "agenda.monatatt@gmail.com", "Email para enviar comprobantes"],
  ["deposito_modo", "PERCENTAGE", "FIXED = monto fijo en CLP. PERCENTAGE = % del total"],
  ["deposito_valor", "30", "Si modo = FIXED, es CLP. Si modo = PERCENTAGE, es %"],
  ["hold_minutos", "30", "Minutos que el slot queda reservado mientras el cliente transfiere"],
  ["recordatorio_horas_antes", "48", "Horas antes de la cita que se envía recordatorio al cliente"]
];
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(configRows), "Configuracion");

// ---------- 11. Correos_Log ----------
const correosHeaders = [
  "id",
  "enviado_en",
  "para",
  "asunto",
  "tipo",
  "reserva_id",
  "resultado"
];
const correoSample = [
  "mail_demo_001",
  "2026-04-19T18:30:00Z",
  "javi.rojas@example.com",
  "Tu reserva en Mona Tatt está confirmada ✦",
  "CLIENT_CONFIRMED",
  "bk_demo_001",
  "SENT"
];
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet([correosHeaders, correoSample]),
  "Correos_Log"
);

XLSX.writeFile(wb, outPath);
console.log(`✔ Template generado en: ${outPath}`);
