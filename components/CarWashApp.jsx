"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Droplets, Users, Receipt, Wallet, Settings, Plus, Trash2, X, Sparkles, Car,
  Store, AlertTriangle, Gift, CreditCard, Smartphone, Banknote, ClipboardList, ChevronDown, ChevronUp,
  ShoppingBag, Wrench, Barcode, Calendar, ChevronLeft, ChevronRight, BarChart3, Search, MessageCircle, Star, FileText, Check, Tag, Lock,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const KEYS = {
  clientes: "lw-clientes",
  gastos: "lw-gastos",
  lavadores: "lw-lavadores",
  tipos: "lw-tipos",
  extras: "lw-extras",
  tickets: "lw-tickets",
  productos: "lw-productos",
  ventas: "lw-ventas",
  repuestos: "lw-repuestos",
  cierres: "lw-cierres",
  cotizaciones: "lw-cotizaciones",
  configCot: "lw-config-cotizacion",
};

const DEFAULT_TIPOS = [
  { id: "t1", nombre: "Lavado de salón", precio: 180 },
  { id: "t2", nombre: "Lavado premium", precio: 45 },
];

const CATEGORIAS_ACEITE = ["Tipo de aceite", "Filtro de motor", "Filtro de aire acondicionado", "Filtro de aceite"];

// Compara texto sin tildes y en minúsculas, para que al buscar "hilux" encuentre
// "Hilux" y "Hídux".
function norm(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const TIPOS_VEHICULO = [
  { id: "auto", nombre: "Auto" },
  { id: "camioneta", nombre: "Camioneta" },
  { id: "suv", nombre: "SUV" },
  { id: "van", nombre: "Van / furgón" },
];

// Catálogo de vehículos con la capacidad aproximada de aceite (litros). Son
// valores de referencia: el dueño los corrige y añade los que quiera desde la
// app, y lo que corrija se guarda.
const veh = (marca, modelo, anio, litros, tipo) => ({ id: `${marca}|${modelo}|${anio}`, marca, modelo, anio, litros, tipo });
const VEHICULOS_INICIALES = [
  // Autos
  veh("Toyota", "Etios 1.5", "2012-2017", 3.5, "auto"),
  veh("Toyota", "Yaris 1.3", "2012-2020", 3.2, "auto"),
  veh("Toyota", "Yaris 1.5", "2018-2022", 4.5, "auto"),
  veh("Toyota", "Corolla 1.6", "2004-2014", 4.0, "auto"),
  veh("Toyota", "Corolla 1.8", "2015-2022", 4.4, "auto"),
  veh("Toyota", "Prius", "2015-2022", 4.5, "auto"),
  veh("Toyota", "Probox 1.5", "2014-2022", 4.0, "auto"),
  veh("Toyota", "Succeed 1.5", "2015-2022", 4.0, "auto"),
  veh("Toyota", "Sienta 1.5", "2016-2022", 4.0, "auto"),
  veh("Toyota", "Avanza 1.5", "2017-2022", 4.4, "auto"),
  veh("Honda", "Fit 1.5", "2014-2022", 4.1, "auto"),
  veh("Honda", "Civic 1.8", "2016-2022", 4.4, "auto"),
  veh("Honda", "City 1.5", "2016-2022", 4.0, "auto"),
  veh("Hyundai", "Accent 1.3", "2012-2020", 3.5, "auto"),
  veh("Hyundai", "i10", "2014-2022", 3.5, "auto"),
  veh("Hyundai", "Elantra 1.6", "2016-2022", 3.6, "auto"),
  veh("Hyundai", "HB20 1.6", "2015-2022", 3.8, "auto"),
  veh("Hyundai", "Creta 1.5", "2020-2022", 3.8, "suv"),
  veh("Hyundai", "Tucson 2.0", "2015-2022", 4.6, "suv"),
  veh("Kia", "Rio 1.4", "2013-2020", 3.5, "auto"),
  veh("Kia", "Forte 1.6", "2016-2022", 3.8, "auto"),
  veh("Kia", "K3", "2016-2022", 3.8, "auto"),
  veh("Kia", "Seltos 1.6", "2020-2022", 3.8, "suv"),
  veh("Kia", "Sportage 2.0", "2016-2022", 4.6, "suv"),
  veh("Nissan", "March 1.6", "2012-2022", 4.0, "auto"),
  veh("Nissan", "Versa 1.6", "2014-2022", 4.4, "auto"),
  veh("Nissan", "Sentra 2.0", "2017-2022", 4.4, "auto"),
  veh("Nissan", "Tiida 1.6", "2012-2016", 4.0, "auto"),
  veh("Nissan", "Almera 1.6", "2014-2019", 4.0, "auto"),
  veh("Chevrolet", "Onix 1.8", "2015-2022", 3.6, "auto"),
  veh("Chevrolet", "Sail 1.8", "2015-2022", 3.7, "auto"),
  veh("Chevrolet", "Spark 1.0", "2012-2022", 3.0, "auto"),
  veh("Chevrolet", "Tracker", "2020-2022", 3.6, "suv"),
  veh("Chevrolet", "Captiva 2.0", "2015-2022", 4.5, "suv"),
  veh("Mitsubishi", "Lancer 1.6", "2010-2016", 4.3, "auto"),
  veh("Subaru", "Impreza 1.8", "2015-2022", 4.0, "auto"),
  veh("Suzuki", "Swift 1.3", "2012-2022", 3.0, "auto"),
  veh("Geely", "CK 1.5", "2012-2022", 3.5, "auto"),
  veh("Geely", "GX7 2.0", "2015-2022", 4.5, "suv"),
  veh("Chery", "Tiggo 2.0", "2015-2022", 4.5, "suv"),
  veh("Great Wall", "Haval H6 2.0", "2015-2022", 4.5, "suv"),
  veh("Volkswagen", "Gol 1.0", "2010-2022", 3.0, "auto"),
  veh("Volkswagen", "Jetta 1.6", "2012-2022", 4.0, "auto"),
  veh("Audi", "A3 1.4", "2014-2022", 4.5, "auto"),
  veh("Audi", "A4 2.0", "2015-2022", 5.0, "auto"),
  veh("BMW", "Serie 3 (320i)", "2015-2022", 5.0, "auto"),
  veh("Mercedes", "C200", "2015-2022", 5.5, "auto"),
  // SUVs
  veh("Toyota", "RAV4 2.0", "2015-2022", 4.6, "suv"),
  veh("Toyota", "RAV4 2.5", "2019-2022", 4.8, "suv"),
  veh("Toyota", "Corolla Cross 2.0", "2021-2022", 4.4, "suv"),
  veh("Toyota", "Rush 1.5", "2018-2022", 4.8, "suv"),
  veh("Jeep", "Compass 2.0", "2017-2022", 4.5, "suv"),
  veh("Jeep", "Renegade 1.8", "2015-2022", 4.5, "suv"),
  veh("Nissan", "Kicks 1.6", "2017-2022", 4.4, "suv"),
  veh("Nissan", "X-Trail 2.0", "2015-2022", 4.6, "suv"),
  veh("Mitsubishi", "Outlander 2.0", "2015-2022", 4.6, "suv"),
  veh("Subaru", "Forester 2.0", "2015-2022", 4.6, "suv"),
  veh("Volkswagen", "Tiguan 2.0", "2015-2022", 4.6, "suv"),
  veh("Suzuki", "Vitara 1.4", "2015-2022", 3.0, "suv"),
  veh("Honda", "CR-V 1.5", "2017-2022", 4.4, "suv"),
  veh("Ford", "EcoSport 1.5", "2015-2022", 4.0, "suv"),
  // Camionetas
  veh("Toyota", "Hilux 2.0", "2015-2022", 8.0, "camioneta"),
  veh("Toyota", "Hilux 2.4", "2015-2022", 8.4, "camioneta"),
  veh("Toyota", "Hilux 2.7", "2015-2022", 8.3, "camioneta"),
  veh("Toyota", "Hilux 2.8", "2015-2022", 8.5, "camioneta"),
  veh("Toyota", "Hilux SW4 2.8", "2017-2022", 8.5, "camioneta"),
  veh("Toyota", "Fortuner 2.7", "2011-2022", 8.0, "camioneta"),
  veh("Ford", "Ranger 2.0", "2015-2022", 8.0, "camioneta"),
  veh("Ford", "Ranger 2.2", "2015-2022", 8.0, "camioneta"),
  veh("Ford", "Ranger 3.2", "2015-2022", 8.5, "camioneta"),
  veh("Mitsubishi", "Pajero Sport 2.5", "2015-2022", 8.0, "camioneta"),
  veh("Mitsubishi", "Pajero Sport 3.0", "2015-2022", 8.5, "camioneta"),
  veh("Nissan", "Navara 2.5", "2015-2022", 8.0, "camioneta"),
  veh("Nissan", "Navara 3.0", "2015-2022", 8.5, "camioneta"),
  veh("Chevrolet", "S10 / D-Max 2.5", "2015-2022", 8.0, "camioneta"),
  veh("Great Wall", "Wingle 2.0", "2015-2022", 7.5, "camioneta"),
  veh("JMC", "V-Series 2.0", "2015-2022", 7.5, "camioneta"),
  // Vans y furgones
  veh("Toyota", "Hiace 2.5", "2014-2022", 8.0, "van"),
  veh("Toyota", "Hiace 2.8", "2019-2022", 8.5, "van"),
  veh("Isuzu", "Elf 3.1", "2014-2022", 7.5, "van"),
  veh("Mercedes", "Sprinter 3.0", "2015-2022", 6.0, "van"),
  veh("Hyundai", "H100 2.5", "2014-2022", 8.0, "van"),
  veh("Nissan", "Caravan 2.5", "2015-2022", 8.0, "van"),
];

// Precios y catálogos de las cotizaciones de aceite. Son valores de ejemplo:
// el dueño los edita desde la app, en la pestaña "Precios" (solo administrador)
// y quedan guardados en la nube.
const CONFIG_COT_DEFAULT = {
  versionCot: 4,
  utilidad: 10,
  // "completo": se cobra el número de envases completos que cubren los litros.
  // "proporcional": se cobra solo por los litros que realmente lleva el carro.
  modoEnvase: "completo",
  corteLitros: 5,
  recargoExtra: 20,
  tiposVehiculo: TIPOS_VEHICULO,
  planes: [
    {
      id: "basico",
      nombre: "Mantenimiento básico",
      extra: { auto: 90, camioneta: 100, suv: 120, van: 130 },
      incluye:
        "Aceite (elección de marca por el cliente), filtro de aceite, revisión de niveles, revisión de presión de neumáticos.",
      opciones: [
        { id: "op1", nombre: "Lavado básico" },
        { id: "op2", nombre: "Pulverizado de motor" },
      ],
    },
    {
      id: "plus",
      nombre: "Mantenimiento plus",
      extra: { auto: 160, camioneta: 190, suv: 200, van: 210 },
      incluye:
        "Aceite (elección de marca por el cliente), filtro de aceite, filtro de aire, revisión de líquidos, revisión de frenos, revisión de suspensión, pulverizado de motor, lavado express, vehículo elevado en máquina Rotary.",
    },
    {
      id: "premium",
      nombre: "Mantenimiento premium",
      extra: { auto: 200, camioneta: 240, suv: 260, van: 260 },
      incluye:
        "Aceite (elección de marca por el cliente), filtro de aceite, filtro de aire, filtro de cabina, rellenado de líquido de parabrisas, lavado de motor completo, aspirado interior, revisión de frenos y suspensión, diagnóstico visual de fugas, lavado premium, lavado de chasis, vehículo elevado en máquina Rotary.",
    },
  ],
  aceites: [
    { id: "o1", nombre: "10W30 Castrol", capacidad: 4, costo: 165 },
    { id: "o2", nombre: "10W30 Mobil Mineral", capacidad: 4, costo: 100 },
    { id: "o3", nombre: "10W30 Shell", capacidad: 4, costo: 165 },
    { id: "o4", nombre: "10W30 Liqui Moly Special Tec", capacidad: 4, costo: 205 },
    { id: "o5", nombre: "10W30 Liqui Moly Molygen", capacidad: 4, costo: 225 },
    { id: "o6", nombre: "10W30 Valvoline 4L", capacidad: 4, costo: 125 },
    { id: "o7", nombre: "10W30 Valvoline 5L", capacidad: 5, costo: 155 },
    { id: "o8", nombre: "10W30 Hyundai 6700", capacidad: 4, costo: 90 },
    { id: "o9", nombre: "10W30 Valvoline Semisintético 4L", capacidad: 4, costo: 105 },
    { id: "o10", nombre: "20W50 Castrol", capacidad: 4, costo: 100 },
    { id: "o11", nombre: "20W50 Shell", capacidad: 4, costo: 100 },
    { id: "o12", nombre: "20W50 Mobil", capacidad: 4, costo: 100 },
    { id: "o13", nombre: "20W50 Vistony", capacidad: 4, costo: 70 },
    { id: "o14", nombre: "20W50 Liqui Moly 5L", capacidad: 5, costo: 185 },
    { id: "o15", nombre: "20W50 Valvoline Mineral", capacidad: 4, costo: 85 },
    { id: "o16", nombre: "20W50 Valvoline Sintético", capacidad: 4, costo: 105 },
    { id: "o17", nombre: "20W50 Hyundai", capacidad: 4, costo: 90 },
    { id: "o18", nombre: "5W30 Liqui Moly Long Time", capacidad: 4, costo: 285 },
    { id: "o19", nombre: "5W30 Liqui Moly Top Tec 4300", capacidad: 4, costo: 285 },
    { id: "o20", nombre: "5W30 Castrol Edge", capacidad: 4, costo: 285 },
    { id: "o21", nombre: "5W30 Castrol Magnatec", capacidad: 4, costo: 175 },
    { id: "o22", nombre: "5W30 Shell Ultra Sintético", capacidad: 4, costo: 225 },
    { id: "o23", nombre: "5W30 Shell HX8 Sintético", capacidad: 4, costo: 185 },
    { id: "o24", nombre: "5W30 Shell HX7 Semisintético", capacidad: 4, costo: 165 },
    { id: "o25", nombre: "5W30 Mobil 1", capacidad: 4, costo: 205 },
    { id: "o26", nombre: "5W30 Mobil Super 3000", capacidad: 4, costo: 205 },
    { id: "o27", nombre: "5W30 Vistony Sintético", capacidad: 4, costo: 105 },
    { id: "o28", nombre: "5W30 Hyundai Sintético", capacidad: 4, costo: 105 },
    { id: "o29", nombre: "10W40 Liqui Moly Molygen 4L", capacidad: 4, costo: 225 },
    { id: "o30", nombre: "10W40 Shell", capacidad: 4, costo: 165 },
    { id: "o31", nombre: "10W40 Mobil", capacidad: 4, costo: 165 },
    { id: "o32", nombre: "10W40 Castrol", capacidad: 4, costo: 165 },
    { id: "o33", nombre: "10W40 Valvoline 5L", capacidad: 5, costo: 155 },
    { id: "o34", nombre: "10W40 Hyundai 6800 Full Sintético", capacidad: 4, costo: 105 },
    { id: "o35", nombre: "10W40 Hyundai 6700 Semi", capacidad: 4, costo: 90 },
    { id: "o36", nombre: "10W40 Vistony", capacidad: 4, costo: 95 },
    { id: "o37", nombre: "25W60 Mobil", capacidad: 4, costo: 95 },
    { id: "o38", nombre: "25W60 Shell", capacidad: 4, costo: 100 },
    { id: "o39", nombre: "25W60 Castrol", capacidad: 4, costo: 85 },
    { id: "o40", nombre: "25W60 Valvoline", capacidad: 4, costo: 70 },
    { id: "o41", nombre: "25W60 Vistony", capacidad: 4, costo: 85 },
    { id: "o42", nombre: "15W40 Hyundai 4L", capacidad: 4, costo: 90 },
    { id: "o43", nombre: "15W40 Hyundai 6L", capacidad: 6, costo: 135 },
    { id: "o44", nombre: "15W40 Vistony", capacidad: 4, costo: 85 },
    { id: "o45", nombre: "15W40 Valvoline", capacidad: 4, costo: 95 },
    { id: "o46", nombre: "15W40 Mobil 6L", capacidad: 6, costo: 145 },
    { id: "o47", nombre: "15W40 Castrol 6L", capacidad: 6, costo: 145 },
    { id: "o48", nombre: "15W40 Mobil 4L", capacidad: 4, costo: 115 },
    { id: "o49", nombre: "15W40 Castrol 4L", capacidad: 4, costo: 105 },
  ],
  extras: [{ id: "x1", nombre: "Engine Flush Liqui Moly", precio: 50 }],
  vehiculos: VEHICULOS_INICIALES,
};

// Precio de venta de un envase de aceite: costo + utilidad, siempre redondeado
// a múltiplo de 10. Ej: 165 + 10% = 181.5 -> 180.
function precioVentaEnvase(costo, utilidad) {
  const conUtilidad = Number(costo || 0) * (1 + Number(utilidad || 0) / 100);
  return Math.round(conUtilidad / 10) * 10;
}

// Cobro del aceite: se venden galones completos (mínimo 1) y el sobrante que no
// completa un galón se cobra por litro redondeado hacia arriba. Si el carro pasa
// del corte de litros, ese litro sobrante lleva el recargo adicional.
function calculoAceite(aceite, litros, config) {
  const capacidad = Number(aceite?.capacidad || 0);
  const ventaGalon = precioVentaEnvase(aceite?.costo, config.utilidad);
  if (!capacidad) return { galones: 0, sobrante: 0, ventaGalon, precioLitro: 0, precioSobrante: 0, total: 0 };
  const galones = Math.max(1, Math.floor(litros / capacidad));
  const sobrante = Math.max(0, Math.ceil(litros - galones * capacidad));
  const precioLitro = ventaGalon / capacidad;
  const recargo = litros > Number(config.corteLitros || 0) ? Number(config.recargoExtra || 0) : 0;
  const precioSobrante = precioLitro * (1 + recargo / 100);
  return {
    galones,
    sobrante,
    ventaGalon,
    precioLitro,
    precioSobrante,
    recargo,
    total: ventaGalon * galones + precioSobrante * sobrante,
  };
}

// Agrupa los aceites por la viscosidad con la que empiezan (10W30, 20W50...),
// para que la lista no sea una sola lista interminable en el selector.
function gruposAceites(aceites) {
  const grupos = [];
  const index = {};
  for (const a of aceites || []) {
    const m = String(a.nombre || "").match(/^\d+W\d+/i);
    const g = m ? m[0].toUpperCase() : "Otros";
    if (!index[g]) {
      index[g] = { grupo: g, aceites: [] };
      grupos.push(index[g]);
    }
    index[g].aceites.push(a);
  }
  return grupos;
}

const CICLO_PROMO = 7;
const PAGOS = [
  { id: "efectivo", label: "Efectivo", icon: Banknote },
  { id: "yape", label: "Yape", icon: Smartphone },
  { id: "tarjeta", label: "Tarjeta", icon: CreditCard },
];

// Reemplaza AQUI_VA_TU_LINK... con tus links reales cuando los tengas.
const LINKS_NEGOCIO = {
  google: "https://g.page/r/9963130498682903457/review",
  tiktok: "https://www.tiktok.com/@maxwashddurand",
};
const MENSAJE_BIENVENIDA_DEFAULT = `Hola {nombre}! Gracias por preferir MaxWash D'Durand. Si quedaste conforme, déjanos tu reseña en Google Maps: ${LINKS_NEGOCIO.google} Y síguenos en TikTok para ver más ofertas: ${LINKS_NEGOCIO.tiktok}. Te esperamos pronto!`;

// Convierte un teléfono a formato WhatsApp del Perú (+51), quitando espacios,
// guiones o el cero inicial. Devuelve null si no hay un número válido.
function telParaWhatsApp(tel) {
  const d = (tel || "").replace(/[^\d]/g, "");
  if (!d) return null;
  return "51" + (d.startsWith("0") ? d.slice(1) : d);
}

const uid = () => Math.random().toString(36).slice(2, 10);
const soles = (n) => `S/ ${Number(n || 0).toFixed(2)}`;
// Da la fecha (YYYY-MM-DD) usando la hora LOCAL del dispositivo, no la hora de
// Londres (UTC). Antes, después de las 7pm en Perú la app ya pensaba que era
// "mañana" porque toISOString() usa UTC — con esto se usa la hora real de Perú.
function fechaLocal(input) {
  const d = input ? new Date(input) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const hoy = () => fechaLocal();

// Reparte el total de un ticket o venta entre efectivo/yape/tarjeta.
// Si tiene "pagos" (pago dividido en 2 o 3 formas), usa eso. Si no, usa el
// campo formaPago de siempre (pago único), como antes.
function desglosarPago(m) {
  const out = { efectivo: 0, yape: 0, tarjeta: 0 };
  if (Array.isArray(m.pagos) && m.pagos.length > 0) {
    m.pagos.forEach((p) => {
      out[p.metodo] = (out[p.metodo] || 0) + Number(p.monto || 0);
    });
  } else {
    const fp = m.formaPago || "efectivo";
    out[fp] = (out[fp] || 0) + Number(m.total || 0);
  }
  return out;
}
const fmtFecha = (iso) => new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
const fmtHora = (iso) => new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

// Abre la consulta oficial gratuita de SUNARP en otra pestaña para que el dueño
// vea la marca y el modelo del vehículo según su placa. SUNARP tiene un captcha
// propio, por eso no se puede llenar solo desde la app: el campo queda para que
// la persona copie Marca / Modelo del resultado oficial.
function buscarPlacaEnSunarp(placa, notify) {
  const limpia = (placa || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  window.open("https://consultavehicular.sunarp.gob.pe/consulta-vehicular", "_blank", "noopener");
  notify(
    limpia
      ? `Abrimos SUNARP: escribe la placa ${limpia}, el código, y copia Marca y Modelo.`
      : "Abrimos SUNARP: escribe la placa, el código de verificación, y copia Marca y Modelo."
  );
}

// Copia de respaldo automática en el navegador + avisos visibles cuando la nube
// no responde. La app SIEMPRE intenta la nube primero; si falla, el dato queda
// seguro en este dispositivo (localStorage) y se vuelve a subir solo cuando la
// conexión vuelve. Así nada se pierde aunque se corte el internet.
let onSaveError = null;
function setOnSaveError(fn) {
  onSaveError = fn;
}
const pendientesDeSubir = new Set();

function mirrorKey(key) {
  return "lw-respaldo-" + key;
}

function mirrorRead(key) {
  try {
    const raw = localStorage.getItem(mirrorKey(key));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function mirrorWrite(key, value) {
  try {
    localStorage.setItem(mirrorKey(key), JSON.stringify(value));
  } catch {
    // el navegador puede rechazar el guardado local; no es fatal
  }
}

function avisarFalloNube() {
  if (typeof onSaveError === "function") {
    try {
      onSaveError(
        "No se pudo guardar en la nube. Tus datos quedaron guardados en este dispositivo y se subirán solos cuando vuelva la conexión."
      );
    } catch {
      // el aviso es solo informativo
    }
  }
}

function useStoredList(key, seed = []) {
  const [list, setList] = useState(null);
  const writingRef = useRef(false);

  const fetchLatest = async () => {
    let res = null;
    try {
      res = await window.storage.get(key, false);
    } catch {
      res = null;
    }
    if (res) {
      // Si quedó algo pendiente de subir, preferimos la copia local y la re-subimos.
      if (!pendientesDeSubir.has(key)) return JSON.parse(res.value);
      const local = mirrorRead(key);
      try {
        await window.storage.set(key, JSON.stringify(local || []), false);
        pendientesDeSubir.delete(key);
        return local || [];
      } catch {
        return local !== null ? local : JSON.parse(res.value);
      }
    }
    // La fila aún no existe en la nube (o no se pudo leer): usamos la copia local.
    const local = mirrorRead(key);
    if (local !== null) {
      try {
        await window.storage.set(key, JSON.stringify(local), false);
        pendientesDeSubir.delete(key);
      } catch {
        // aún sin conexión: se reintentará en el próximo chequeo
      }
      return local;
    }
    return seed;
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      const data = await fetchLatest();
      if (alive) setList(data);
    })();

    // Vuelve a consultar la nube cada cierto tiempo y al volver a la pestaña,
    // para que lo que agrega el admin (u otro dispositivo) aparezca sin recargar.
    const refresh = async () => {
      if (writingRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return; // no gastar datos con la pestaña en segundo plano
      const data = await fetchLatest();
      if (!alive) return;
      setList((prev) => (JSON.stringify(prev) === JSON.stringify(data) ? prev : data));
    };

    const interval = setInterval(refresh, 60000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);

    return () => {
      alive = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, [key]);

  const persist = async (next) => {
    writingRef.current = true;
    setList(next);
    mirrorWrite(key, next);
    try {
      await window.storage.set(key, JSON.stringify(next), false);
      pendientesDeSubir.delete(key);
    } catch {
      pendientesDeSubir.add(key);
      avisarFalloNube();
    } finally {
      writingRef.current = false;
    }
  };

  return [list, persist];
}

// Guarda a los clientes en su propia tabla de Supabase, uno por fila, en vez de
// un solo bloque gigante — así agregar el cliente #500 es tan rápido y liviano
// como agregar el #1, y nunca se "corta" el registro por acumular demasiados datos.
function useClientesRemote(seed = []) {
  const [list, setList] = useState(null);
  const writingRef = useRef(false);

  const leerLegacy = async () => {
    try {
      const legacy = await window.storage.get("lw-clientes", false);
      const antiguos = legacy ? JSON.parse(legacy.value) : [];
      return Array.isArray(antiguos) && antiguos.length > 0 ? antiguos : null;
    } catch {
      return null;
    }
  };

  // Si quedó algo pendiente de subir (ej. se cortó la conexión), tomamos la copia
  // local como la verdad, la subimos completa y borramos de la nube lo que ya no
  // existe. Así el dispositivo y la nube vuelven a quedar idénticos.
  const resyncLocal = async (dataCloud) => {
    const local = mirrorRead("clientes");
    if (!Array.isArray(local)) return null;
    try {
      const localIds = new Set(local.map((c) => c.id));
      const cloudIds = new Set((dataCloud || []).map((c) => c.id));
      for (const c of local) await supabase.from("clientes").upsert(c);
      for (const id of cloudIds) {
        if (!localIds.has(id)) await supabase.from("clientes").delete().eq("id", id);
      }
      pendientesDeSubir.delete("clientes");
      return local;
    } catch {
      return local;
    }
  };

  const fetchAll = async () => {
    if (!supabase) return mirrorRead("clientes") || (await leerLegacy()) || seed;
    let data = null;
    let error = null;
    try {
      const res = await supabase.from("clientes").select("*").order("fecha", { ascending: true });
      data = res.data;
      error = res.error;
    } catch (e) {
      error = e;
    }
    if (!error && data) {
      if (pendientesDeSubir.has("clientes")) {
        const local = await resyncLocal(data);
        if (local) return local;
        pendientesDeSubir.delete("clientes");
        return data.length ? data : seed;
      }
      if (data.length > 0) return data;
      // La nube está vacía: recuperamos la copia local (o el sistema antiguo).
      const local = mirrorRead("clientes");
      if (Array.isArray(local) && local.length > 0) {
        for (const c of local) {
          try {
            await supabase.from("clientes").upsert(c);
          } catch {
            // se reintentará en la próxima carga
          }
        }
        return local;
      }
      return (await leerLegacy()) || seed;
    }
    // No se pudo leer la nube: usamos las copias locales / antiguas sin perder nada.
    return mirrorRead("clientes") || (await leerLegacy()) || data || seed;
  };

  // Para las revisiones periódicas NO pedimos la foto (son el dato más pesado);
  // solo comparamos los demás datos. Si algo cambió de verdad, recién ahí se
  // trae todo completo (con fotos). Esto evita re-descargar cientos de fotos
  // cada minuto cuando nada cambió, que es lo que agota la cuota gratis de Supabase.
  const fetchLigero = async () => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id,nombre,telefono,placa,vehiculo,fecha")
        .order("fecha", { ascending: true });
      if (error) return null;
      return data || [];
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let alive = true;
    let listaActual = [];

    (async () => {
      const data = await fetchAll();
      listaActual = data;
      if (alive) setList(data);
    })();

    const refresh = async () => {
      if (writingRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return; // no gastar datos con la pestaña en segundo plano
      const ligero = await fetchLigero();
      if (!alive || ligero === null) return;
      const actualLigero = (listaActual || []).map(({ foto, ...resto }) => resto);
      if (JSON.stringify(actualLigero) === JSON.stringify(ligero)) return; // nada cambió: no gastamos en traer fotos
      const completo = await fetchAll();
      if (!alive) return;
      listaActual = completo;
      setList(completo);
    };

    const interval = setInterval(refresh, 60000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);

    return () => {
      alive = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const persist = async (next) => {
    writingRef.current = true;
    const prev = list || [];
    setList(next);
    mirrorWrite("clientes", next);
    try {
      const prevById = Object.fromEntries(prev.map((c) => [c.id, c]));
      const nextIds = new Set(next.map((c) => c.id));
      const eliminados = prev.filter((c) => !nextIds.has(c.id));
      const paraGuardar = next.filter((c) => JSON.stringify(prevById[c.id]) !== JSON.stringify(c));
      for (const c of eliminados) {
        await supabase.from("clientes").delete().eq("id", c.id);
      }
      for (const c of paraGuardar) {
        await supabase.from("clientes").upsert(c);
      }
      pendientesDeSubir.delete("clientes");
    } catch {
      pendientesDeSubir.add("clientes");
      avisarFalloNube();
    } finally {
      writingRef.current = false;
    }
  };

  return [list, persist];
}

// Versión genérica del hook anterior, para cualquier tabla que necesite guardar
// cada registro por separado (en vez de un solo bloque). "legacyKey" es la
// clave antigua en kv_store desde donde se traspasan los datos una sola vez,
// para no perder lo que ya estaba guardado con el sistema anterior.
function useTableRemote(table, seed = [], legacyKey = null) {
  const [list, setList] = useState(null);
  const writingRef = useRef(false);

  const fetchAll = async () => {
    const mirrorK = "tabla:" + table;
    const leerLegacy = async () => {
      if (!legacyKey) return null;
      try {
        const legacy = await window.storage.get(legacyKey, false);
        const antiguos = legacy ? JSON.parse(legacy.value) : [];
        return Array.isArray(antiguos) && antiguos.length > 0 ? antiguos : null;
      } catch {
        return null;
      }
    };
    const resyncLocal = async (dataCloud) => {
      const local = mirrorRead(mirrorK);
      if (!Array.isArray(local)) return null;
      try {
        const localIds = new Set(local.map((c) => c.id));
        const cloudIds = new Set((dataCloud || []).map((c) => c.id));
        for (const item of local) await supabase.from(table).upsert(item);
        for (const id of cloudIds) {
          if (!localIds.has(id)) await supabase.from(table).delete().eq("id", id);
        }
        pendientesDeSubir.delete(mirrorK);
        return local;
      } catch {
        return local;
      }
    };
    if (!supabase) return mirrorRead(mirrorK) || (await leerLegacy()) || seed;
    let data = null;
    let error = null;
    try {
      const res = await supabase.from(table).select("*").order("fecha", { ascending: true });
      data = res.data;
      error = res.error;
    } catch (e) {
      error = e;
    }
    if (!error && data) {
      if (pendientesDeSubir.has(mirrorK)) {
        const local = await resyncLocal(data);
        if (local) return local;
        pendientesDeSubir.delete(mirrorK);
        return data.length ? data : seed;
      }
      if (data.length > 0) return data;
      const local = mirrorRead(mirrorK);
      if (Array.isArray(local) && local.length > 0) {
        for (const item of local) {
          try {
            await supabase.from(table).upsert(item);
          } catch {
            // se reintentará en la próxima carga
          }
        }
        return local;
      }
      const legacy = await leerLegacy();
      if (legacy) return legacy;
      return seed;
    }
    return mirrorRead(mirrorK) || (await leerLegacy()) || data || seed;
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      const data = await fetchAll();
      if (alive) setList(data);
    })();

    const refresh = async () => {
      if (writingRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return; // no gastar datos con la pestaña en segundo plano
      const data = await fetchAll();
      if (!alive) return;
      setList((prev) => (JSON.stringify(prev) === JSON.stringify(data) ? prev : data));
    };

    const interval = setInterval(refresh, 60000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);

    return () => {
      alive = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const persist = async (next) => {
    writingRef.current = true;
    const mirrorK = "tabla:" + table;
    const prev = list || [];
    setList(next);
    mirrorWrite(mirrorK, next);
    try {
      const prevById = Object.fromEntries(prev.map((c) => [c.id, c]));
      const nextIds = new Set(next.map((c) => c.id));
      const eliminados = prev.filter((c) => !nextIds.has(c.id));
      const paraGuardar = next.filter((c) => JSON.stringify(prevById[c.id]) !== JSON.stringify(c));
      for (const c of eliminados) {
        await supabase.from(table).delete().eq("id", c.id);
      }
      for (const c of paraGuardar) {
        await supabase.from(table).upsert(c);
      }
      pendientesDeSubir.delete(mirrorK);
    } catch {
      pendientesDeSubir.add(mirrorK);
      avisarFalloNube();
    } finally {
      writingRef.current = false;
    }
  };

  return [list, persist];
}

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>{children}</div>;
}

function StatCard({ label, value, icon: Icon, tone }) {
  const tones = {
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 truncate">{label}</p>
        <p className="text-lg font-bold text-slate-800 truncate">{value}</p>
      </div>
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500";

function EmptyState({ text }) {
  return <p className="text-sm text-slate-400 italic py-6 text-center">{text}</p>;
}

// Solo cuentas cerradas (pagadas) cuentan para la promoción de fidelidad.
function esCerrado(t) {
  return t.estado === "cerrado" || t.estado === undefined;
}
function contarLavadas(tickets, clienteId) {
  return tickets.filter((t) => t.clienteId === clienteId && esCerrado(t)).length;
}
function fechaCobro(t) {
  return t.fechaCobro || t.fecha;
}

export default function CarWashApp({ role = "admin" }) {
  const isAdmin = role === "admin";
  const [tab, setTab] = useState("dashboard");
  const [focusTicketId, setFocusTicketId] = useState(null);
  const [clientes, setClientes] = useClientesRemote([]);
  const [gastos, setGastos] = useStoredList(KEYS.gastos, []);
  const [lavadores, setLavadores] = useStoredList(KEYS.lavadores, []);
  const [tipos, setTipos] = useStoredList(KEYS.tipos, DEFAULT_TIPOS);
  const [extras, setExtras] = useStoredList(KEYS.extras, []);
  const [tickets, setTickets] = useTableRemote("tickets", [], KEYS.tickets);
  const [productos, setProductos] = useStoredList(KEYS.productos, []);
  const [ventas, setVentas] = useTableRemote("ventas", [], KEYS.ventas);
  const [repuestos, setRepuestos] = useStoredList(KEYS.repuestos, []);
  const [cierres, setCierres] = useStoredList(KEYS.cierres, []);
  const [cotizaciones, setCotizaciones] = useStoredList(KEYS.cotizaciones, []);
  const [configCotList, setConfigCotList] = useStoredList(KEYS.configCot, [CONFIG_COT_DEFAULT]);

  const loading = [clientes, gastos, lavadores, tipos, extras, tickets, productos, ventas, repuestos, cierres].some((l) => l === null);

  const [toast, setToast] = useState(null);
  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    setOnSaveError(() => notify);
    return () => setOnSaveError(null);
  }, []);

  const abiertas = useMemo(() => (tickets || []).filter((t) => t.estado === "abierto"), [tickets]);
  const cerradasHoy = useMemo(
    () => (tickets || []).filter((t) => esCerrado(t) && fechaLocal(fechaCobro(t)) === hoy()),
    [tickets]
  );
  const gastosHoy = useMemo(() => (gastos || []).filter((g) => fechaLocal(g.fecha) === hoy()), [gastos]);
  const ventasHoy = useMemo(() => (ventas || []).filter((v) => fechaLocal(v.fecha) === hoy()), [ventas]);
  const ingresosHoy = cerradasHoy.reduce((s, t) => s + t.total, 0) + ventasHoy.reduce((s, v) => s + v.total, 0);
  const propinasHoy = cerradasHoy.reduce((s, t) => s + Number(t.propina || 0), 0);
  const gastosTotalHoy = gastosHoy.reduce((s, g) => s + Number(g.monto || 0), 0);
  const stockBajoTienda = (productos || []).filter((p) => Number(p.stock) <= Number(p.stockMinimo));
  const stockBajoAceite = (repuestos || []).filter((p) => Number(p.stock) <= Number(p.stockMinimo));
  const valorInventarioTotal =
    (productos || []).reduce((s, p) => s + Number(p.costo || 0) * Number(p.stock || 0), 0) +
    (repuestos || []).reduce((s, r) => s + Number(r.costo || 0) * Number(r.stock || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-teal-700">
          <Droplets className="animate-bounce" size={22} />
          <span className="text-sm font-medium">Cargando…</span>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Resumen", icon: Sparkles },
    { id: "lavada", label: "Abrir cuenta", icon: Car },
    { id: "cuentas", label: "Cuentas", icon: ClipboardList, badge: abiertas.length },
    { id: "caja", label: "Cierre de caja", icon: Receipt },
    ...(isAdmin ? [{ id: "historial", label: "Historial", icon: Calendar }] : []),
    { id: "clientes", label: "Clientes", icon: Users },
    { id: "cotizaciones", label: "Cotizaciones", icon: FileText },
    ...(isAdmin ? [{ id: "precios", label: "Precios", icon: Tag }] : []),
    { id: "tienda", label: "Tienda", icon: Store },
    { id: "aceite", label: "Cambio de aceite", icon: Wrench },
    { id: "gastos", label: "Gastos", icon: Wallet },
    { id: "catalogo", label: "Catálogo", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-slate-900 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center shrink-0">
            <Droplets size={18} />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base leading-tight truncate">MaxWash D'Durand</h1>
            <p className="text-[11px] text-slate-400 leading-tight">Control de lavados y tienda</p>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 sticky top-[60px] z-10 overflow-x-auto">
        <div className="flex px-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex flex-col items-center gap-1 px-3 py-2.5 text-[11px] font-medium border-b-2 whitespace-nowrap ${
                  active ? "border-teal-600 text-teal-700" : "border-transparent text-slate-400"
                }`}
              >
                <Icon size={17} />
                {t.label}
                {!!t.badge && (
                  <span className="absolute top-1 right-0.5 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="p-4 max-w-2xl mx-auto space-y-4">
        {tab === "dashboard" && (
          <Dashboard
            cerradasHoy={cerradasHoy}
            abiertas={abiertas}
            ventasHoy={ventasHoy}
            ingresosHoy={ingresosHoy}
            propinasHoy={propinasHoy}
            gastosTotalHoy={gastosTotalHoy}
            clientes={clientes}
            lavadores={lavadores}
            tipos={tipos}
            stockBajoTienda={stockBajoTienda}
            stockBajoAceite={stockBajoAceite}
            valorInventarioTotal={valorInventarioTotal}
            irACuentas={() => setTab("cuentas")}
          />
        )}
        {tab === "lavada" && (
          <AbrirCuenta
            clientes={clientes}
            setClientes={setClientes}
            lavadores={lavadores}
            tipos={tipos}
            tickets={tickets}
            setTickets={setTickets}
            notify={notify}
            onAbierta={(id) => {
              setFocusTicketId(id);
              setTab("cuentas");
            }}
          />
        )}
        {tab === "cuentas" && (
          <Cuentas
            abiertas={abiertas}
            focusTicketId={focusTicketId}
            clearFocus={() => setFocusTicketId(null)}
            clientes={clientes}
            setClientes={setClientes}
            lavadores={lavadores}
            tipos={tipos}
            extras={extras}
            productos={productos}
            setProductos={setProductos}
            repuestos={repuestos}
            setRepuestos={setRepuestos}
            tickets={tickets}
            setTickets={setTickets}
            notify={notify}
          />
        )}
        {tab === "caja" && (
          <Caja
            tickets={tickets}
            setTickets={setTickets}
            ventas={ventas}
            setVentas={setVentas}
            gastos={gastos}
            cierres={cierres}
            setCierres={setCierres}
            productos={productos}
            setProductos={setProductos}
            role={role}
            notify={notify}
          />
        )}
        {tab === "historial" && isAdmin && (
          <Historial tickets={tickets} ventas={ventas} clientes={clientes} cierres={cierres} />
        )}
        {tab === "clientes" && (
          <Clientes clientes={clientes} setClientes={setClientes} tickets={tickets} notify={notify} />
        )}
        {tab === "cotizaciones" && (
          <Cotizaciones
            clientes={clientes}
            cotizaciones={cotizaciones}
            setCotizaciones={setCotizaciones}
            configCotList={configCotList}
            esAdmin={isAdmin}
            irAPrecios={() => setTab("precios")}
            notify={notify}
          />
        )}
        {tab === "precios" && isAdmin && (
          <PreciosAdmin configCotList={configCotList} setConfigCotList={setConfigCotList} notify={notify} />
        )}
        {tab === "tienda" && (
          <Tienda productos={productos} setProductos={setProductos} ventas={ventas} setVentas={setVentas} notify={notify} isAdmin={isAdmin} />
        )}
        {tab === "aceite" && (
          <CambioAceite repuestos={repuestos} setRepuestos={setRepuestos} notify={notify} isAdmin={isAdmin} />
        )}
        {tab === "gastos" && <Gastos gastos={gastos} setGastos={setGastos} notify={notify} />}
        {tab === "catalogo" && (
          <Catalogo
            tipos={tipos}
            setTipos={setTipos}
            extras={extras}
            setExtras={setExtras}
            lavadores={lavadores}
            setLavadores={setLavadores}
            notify={notify}
            isAdmin={isAdmin}
          />
        )}
      </main>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-20 max-w-[90%] text-center">
          {toast}
        </div>
      )}
    </div>
  );
}

function Caja({ tickets, setTickets, ventas, setVentas, gastos, cierres, setCierres, productos, setProductos, role, notify }) {
  const fechaHoy = hoy();

  const cerradasHoy = useMemo(
    () => (tickets || []).filter((t) => esCerrado(t) && fechaLocal(fechaCobro(t)) === fechaHoy),
    [tickets, fechaHoy]
  );
  const ventasHoy = useMemo(() => (ventas || []).filter((v) => fechaLocal(v.fecha) === fechaHoy), [ventas, fechaHoy]);
  const gastosHoy = useMemo(() => (gastos || []).filter((g) => fechaLocal(g.fecha) === fechaHoy), [gastos, fechaHoy]);

  const porPago = { efectivo: 0, yape: 0, tarjeta: 0 };
  [...cerradasHoy, ...ventasHoy].forEach((m) => {
    const d = desglosarPago(m);
    porPago.efectivo += d.efectivo;
    porPago.yape += d.yape;
    porPago.tarjeta += d.tarjeta;
  });
  const totalIngresos = porPago.efectivo + porPago.yape + porPago.tarjeta;
  const totalGastos = gastosHoy.reduce((s, g) => s + Number(g.monto || 0), 0);
  const neto = totalIngresos - totalGastos;

  const yaCerrada = (cierres || []).find((c) => c.fecha === fechaHoy);

  const corregirPagoTicket = async (id, nuevaForma) => {
    await setTickets(tickets.map((t) => (t.id === id ? { ...t, formaPago: nuevaForma, pagos: null } : t)));
    notify("Forma de pago corregida");
  };

  const eliminarTicket = async (id) => {
    await setTickets(tickets.filter((t) => t.id !== id));
    notify("Ingreso eliminado. Recuerda que el stock usado en esa cuenta no se repone solo.");
  };

  const corregirPagoVenta = async (id, nuevaForma) => {
    await setVentas(ventas.map((v) => (v.id === id ? { ...v, formaPago: nuevaForma, pagos: null } : v)));
    notify("Forma de pago corregida");
  };

  const eliminarVenta = async (v) => {
    await setProductos((productos || []).map((p) => (p.id === v.productoId ? { ...p, stock: p.stock + v.cantidad } : p)));
    await setVentas(ventas.filter((x) => x.id !== v.id));
    notify("Venta eliminada y stock repuesto");
  };

  const cerrarCaja = async () => {
    if (yaCerrada) return;
    const registro = {
      id: uid(),
      fecha: fechaHoy,
      efectivo: porPago.efectivo,
      yape: porPago.yape,
      tarjeta: porPago.tarjeta,
      totalIngresos,
      totalGastos,
      neto,
      cerradoPor: role === "admin" ? "Administrador" : "Personal del local",
      cerradoEn: new Date().toISOString(),
    };
    await setCierres([...(cierres || []), registro]);
    notify("Caja del día cerrada y guardada");
  };

  const resumen = yaCerrada || { efectivo: porPago.efectivo, yape: porPago.yape, tarjeta: porPago.tarjeta, totalIngresos, totalGastos, neto };

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-1">
        <p className="text-xs text-slate-400">Cierre de caja de hoy · {fechaHoy}</p>
        <p className="text-2xl font-bold text-slate-800">{soles(resumen.neto)}</p>
        <p className="text-xs text-slate-400">Ingresos {soles(resumen.totalIngresos)} · Gastos {soles(resumen.totalGastos)}</p>
      </Card>

      <Card className="p-4 space-y-2.5">
        <h2 className="font-semibold text-slate-800 text-sm">Ingresado por forma de pago</h2>
        {PAGOS.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Icon size={14} /> {p.label}
              </span>
              <span className="font-medium text-slate-800">{soles(resumen[p.id] || 0)}</span>
            </div>
          );
        })}
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="font-semibold text-slate-800 text-sm">Ingresos de hoy — corregir si algo se registró mal</h2>
        {yaCerrada && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
            La caja de hoy ya está cerrada. Si necesitas corregir algo, avísale al administrador.
          </p>
        )}
        {cerradasHoy.length === 0 && ventasHoy.length === 0 ? (
          <EmptyState text="Aún no hay cobros hoy." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {cerradasHoy.map((t) => (
              <li key={t.id} className="py-2 flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-slate-700 truncate">Cuenta · {fmtHora(t.fechaCobro)}</p>
                  <p className="text-xs text-slate-400">{Array.isArray(t.pagos) && t.pagos.length ? "Pago dividido" : PAGOS.find((p) => p.id === t.formaPago)?.label || "Efectivo"}</p>
                </div>
                <span className="font-semibold text-slate-800 shrink-0">{soles(t.total)}</span>
                {!yaCerrada && !(Array.isArray(t.pagos) && t.pagos.length) && (
                  <select
                    className="text-xs border border-slate-200 rounded-lg px-1.5 py-1 shrink-0"
                    value={t.formaPago || "efectivo"}
                    onChange={(e) => corregirPagoTicket(t.id, e.target.value)}
                  >
                    {PAGOS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                )}
                {!yaCerrada && (
                  <button onClick={() => eliminarTicket(t.id)} className="text-slate-300 hover:text-rose-500 shrink-0">
                    <Trash2 size={15} />
                  </button>
                )}
              </li>
            ))}
            {ventasHoy.map((v) => (
              <li key={v.id} className="py-2 flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-slate-700 truncate">{v.nombreProducto} · {fmtHora(v.fecha)}</p>
                  <p className="text-xs text-slate-400">{Array.isArray(v.pagos) && v.pagos.length ? "Pago dividido" : PAGOS.find((p) => p.id === v.formaPago)?.label || "Efectivo"}</p>
                </div>
                <span className="font-semibold text-slate-800 shrink-0">{soles(v.total)}</span>
                {!yaCerrada && !(Array.isArray(v.pagos) && v.pagos.length) && (
                  <select
                    className="text-xs border border-slate-200 rounded-lg px-1.5 py-1 shrink-0"
                    value={v.formaPago || "efectivo"}
                    onChange={(e) => corregirPagoVenta(v.id, e.target.value)}
                  >
                    {PAGOS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                )}
                {!yaCerrada && (
                  <button onClick={() => eliminarVenta(v)} className="text-slate-300 hover:text-rose-500 shrink-0">
                    <Trash2 size={15} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {yaCerrada ? (
        <Card className="p-4 bg-teal-50 border-teal-200 space-y-1">
          <p className="text-sm font-semibold text-teal-800">✓ Caja cerrada</p>
          <p className="text-xs text-teal-700">
            Cerrada por {yaCerrada.cerradoPor} a las {new Date(yaCerrada.cerradoEn).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-xs text-teal-700">Este resumen ya quedó guardado y el administrador puede revisarlo cuando quiera.</p>
        </Card>
      ) : (
        <button onClick={cerrarCaja} className="w-full bg-slate-800 text-white rounded-lg py-3 text-sm font-semibold">
          Cerrar caja de hoy
        </button>
      )}
    </div>
  );
}


function Historial({ tickets, ventas, clientes, cierres }) {
  const now = new Date();
  const [mesRef, setMesRef] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [year, month] = mesRef.split("-").map(Number); // month: 1-12

  const cambiarMes = (delta) => {
    const d = new Date(year, month - 1 + delta, 1);
    setMesRef(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  // Une cuentas cerradas + ventas de tienda del mes seleccionado, cada una con fecha y forma de pago.
  const movimientos = useMemo(() => {
    const prefix = mesRef; // "YYYY-MM"
    const deTickets = (tickets || [])
      .filter((t) => esCerrado(t) && fechaLocal(fechaCobro(t)).slice(0, 7) === prefix)
      .map((t) => ({ fecha: fechaLocal(fechaCobro(t)), total: Number(t.total || 0), formaPago: t.formaPago || "efectivo", pagos: t.pagos }));
    const deVentas = (ventas || [])
      .filter((v) => fechaLocal(v.fecha).slice(0, 7) === prefix)
      .map((v) => ({ fecha: fechaLocal(v.fecha), total: Number(v.total || 0), formaPago: v.formaPago || "efectivo", pagos: v.pagos }));
    return [...deTickets, ...deVentas];
  }, [tickets, ventas, mesRef]);

  const totalMes = movimientos.reduce((s, m) => s + m.total, 0);

  const porPago = useMemo(() => {
    const acc = { efectivo: 0, yape: 0, tarjeta: 0 };
    movimientos.forEach((m) => {
      const d = desglosarPago(m);
      acc.efectivo += d.efectivo;
      acc.yape += d.yape;
      acc.tarjeta += d.tarjeta;
    });
    return acc;
  }, [movimientos]);

  const porDia = useMemo(() => {
    const acc = {};
    movimientos.forEach((m) => {
      acc[m.fecha] = (acc[m.fecha] || 0) + m.total;
    });
    return acc;
  }, [movimientos]);

  const maxPago = Math.max(1, ...Object.values(porPago));
  const maxDia = Math.max(1, ...Object.values(porDia));
  const promedioDia = totalMes / Math.max(1, Object.keys(porDia).length || 1);

  const diasDelMes = new Date(year, month, 0).getDate();
  const primerDiaSemana = new Date(year, month - 1, 1).getDay(); // 0=domingo
  const celdas = [...Array(primerDiaSemana).fill(null), ...Array.from({ length: diasDelMes }, (_, i) => i + 1)];

  const nombreMes = new Date(year, month - 1, 1).toLocaleDateString("es-PE", { month: "long", year: "numeric" });

  const colorCelda = (monto) => {
    if (monto === undefined) return "bg-white text-slate-300";
    if (monto === 0) return "bg-slate-100 text-slate-400";
    const ratio = monto / maxDia;
    if (ratio > 0.75) return "bg-teal-600 text-white";
    if (ratio > 0.45) return "bg-teal-400 text-white";
    if (ratio > 0.2) return "bg-teal-200 text-teal-900";
    return "bg-amber-100 text-amber-800"; // día flojo, resalta para promos/descuentos
  };

  // Días con menor ingreso del mes (para sugerir ofertas), solo entre días que ya pasaron y tuvieron movimiento o cero.
  const diasFlojos = useMemo(() => {
    const hoyStr = hoy();
    const dias = Array.from({ length: diasDelMes }, (_, i) => {
      const d = i + 1;
      const fecha = `${mesRef}-${String(d).padStart(2, "0")}`;
      if (fecha > hoyStr) return null;
      return { fecha, monto: porDia[fecha] || 0, diaSemana: new Date(year, month - 1, d).toLocaleDateString("es-PE", { weekday: "long" }) };
    }).filter(Boolean);
    return dias.sort((a, b) => a.monto - b.monto).slice(0, 3);
  }, [porDia, mesRef, diasDelMes, year, month]);

  // Detalle día a día del mes: monto cobrado y acumulado hasta cada día.
  // En el mes actual solo muestra los días que ya pasaron (los futuros se ven
  // cuando lleguen), para ver "cómo van siendo los días".
  const diasDetalle = useMemo(() => {
    const hoyStr = hoy();
    const esMesActual = mesRef === hoyStr.slice(0, 7);
    const out = [];
    let acumulado = 0;
    for (let d = 1; d <= diasDelMes; d++) {
      const fecha = `${mesRef}-${String(d).padStart(2, "0")}`;
      const monto = porDia[fecha] || 0;
      acumulado += monto;
      if (esMesActual && d > Number(hoyStr.slice(8, 10))) break;
      out.push({
        d,
        fecha,
        monto,
        acumulado,
        esHoy: fecha === hoyStr,
        diaSemana: new Date(year, month - 1, d).toLocaleDateString("es-PE", { weekday: "long" }),
      });
    }
    return out;
  }, [porDia, mesRef, diasDelMes, year, month]);

  return (
    <div className="space-y-4">
      <Card className="p-4 flex items-center justify-between">
        <button onClick={() => cambiarMes(-1)} className="p-1.5 text-slate-500 hover:text-slate-800">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="font-semibold text-slate-800 text-sm capitalize">{nombreMes}</p>
          <p className="text-xs text-slate-400">Historial de ingresos</p>
        </div>
        <button onClick={() => cambiarMes(1)} className="p-1.5 text-slate-500 hover:text-slate-800">
          <ChevronRight size={20} />
        </button>
      </Card>

      <Card className="p-4 space-y-1">
        <p className="text-xs text-slate-400">Total cobrado en el mes</p>
        <p className="text-2xl font-bold text-slate-800">{soles(totalMes)}</p>
        <p className="text-xs text-slate-400">Promedio por día con movimiento: {soles(promedioDia)}</p>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-slate-800">
          <BarChart3 size={17} />
          <h2 className="font-semibold text-sm">Cobrado por forma de pago</h2>
        </div>
        {totalMes === 0 ? (
          <EmptyState text="Todavía no hay cobros este mes." />
        ) : (
          <div className="space-y-2.5">
            {PAGOS.map((p) => {
              const monto = porPago[p.id] || 0;
              const pct = totalMes ? Math.round((monto / totalMes) * 100) : 0;
              const Icon = p.icon;
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Icon size={14} /> {p.label}
                    </span>
                    <span className="text-slate-500">{soles(monto)} · {pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-600"
                      style={{ width: `${Math.max(3, (monto / maxPago) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-slate-800">
          <Calendar size={17} />
          <h2 className="font-semibold text-sm">Calendario de ingresos del mes</h2>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 font-medium">
          {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {celdas.map((d, i) => {
            if (d === null) return <div key={i} />;
            const fecha = `${mesRef}-${String(d).padStart(2, "0")}`;
            const monto = porDia[fecha];
            return (
              <div
                key={i}
                title={monto ? soles(monto) : "Sin cobros"}
                className={`aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${colorCelda(monto)}`}
              >
                <span>{d}</span>
                {monto > 0 && <span className="text-[8px] leading-none opacity-90">S/{monto >= 1000 ? `${Math.round(monto / 100) / 10}k` : Math.round(monto)}</span>}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-teal-600 inline-block" /> Día fuerte</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-100 inline-block" /> Día flojo</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-100 inline-block" /> Sin cobros</span>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-slate-800">
          <BarChart3 size={17} />
          <h2 className="font-semibold text-sm">Monto por día del mes</h2>
        </div>
        {diasDetalle.length === 0 ? (
          <EmptyState text="Este mes todavía no tiene días con información." />
        ) : (
          <>
            <p className="text-xs text-slate-400">
              Acumulado al último día: <strong className="text-slate-700">{soles(diasDetalle[diasDetalle.length - 1].acumulado)}</strong> · {diasDetalle.filter((x) => x.monto > 0).length} día{diasDetalle.filter((x) => x.monto > 0).length !== 1 ? "s" : ""} con cobros
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium px-1">
                <span className="w-20 shrink-0">Día</span>
                <span className="flex-1">Ritmo</span>
                <span className="w-20 shrink-0 text-right">Cobrado</span>
                <span className="w-20 shrink-0 text-right">Acumulado</span>
              </div>
              {diasDetalle.map((x) => {
                const fuerte = x.monto > 0 && x.monto >= promedioDia;
                return (
                  <div
                    key={x.fecha}
                    className={`flex items-center gap-2 py-1.5 px-1 rounded-lg text-sm ${x.esHoy ? "bg-teal-50 border border-teal-200" : ""}`}
                  >
                    <span className="w-20 shrink-0 text-xs text-slate-600 capitalize">
                      {x.diaSemana} {x.d}
                      {x.esHoy && <span className="ml-1 text-[9px] font-bold text-teal-700 uppercase">Hoy</span>}
                    </span>
                    <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${x.monto === 0 ? "bg-slate-200" : x.monto >= promedioDia ? "bg-teal-600" : "bg-amber-400"}`}
                        style={{ width: `${maxDia > 0 ? Math.min(100, (x.monto / maxDia) * 100) : 0}%` }}
                      />
                    </div>
                    <span className={`w-20 shrink-0 text-right text-sm ${x.monto === 0 ? "text-slate-300" : fuerte ? "text-teal-700 font-medium" : "text-amber-700 font-medium"}`}>
                      {x.monto > 0 ? soles(x.monto) : "S/ 0,00"}
                    </span>
                    <span className="w-20 shrink-0 text-right text-xs text-slate-400">{soles(x.acumulado)}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {diasFlojos.length > 0 && diasFlojos.some((d) => d.monto < promedioDia) && (
        <Card className="p-4 space-y-2 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle size={16} />
            <h2 className="font-semibold text-sm">Días flojos este mes</h2>
          </div>
          <p className="text-xs text-amber-800">Considera hacer descuentos u ofertas en estos días para atraer más clientes:</p>
          <ul className="text-xs text-amber-900 space-y-1">
            {diasFlojos.map((d) => (
              <li key={d.fecha} className="flex justify-between">
                <span className="capitalize">{d.diaSemana} {d.fecha.slice(8, 10)}/{d.fecha.slice(5, 7)}</span>
                <span className="font-medium">{soles(d.monto)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <VehiculosFrecuentes tickets={tickets} clientes={clientes} />

      <CierresGuardados cierres={cierres} />

      <RespaldoDatos clientes={clientes} tickets={tickets} ventas={ventas} cierres={cierres} />
    </div>
  );
}

function VehiculosFrecuentes({ tickets, clientes }) {
  const ranking = useMemo(() => {
    const porCliente = {};
    (clientes || []).forEach((c) => {
      porCliente[c.id] = (c.vehiculo || "").trim();
    });
    const conteo = {};
    (tickets || []).forEach((t) => {
      if (!esCerrado(t) || !t.clienteId) return;
      const veh = porCliente[t.clienteId];
      if (!veh) return;
      const clave = veh.toLowerCase();
      if (!conteo[clave]) conteo[clave] = { nombre: veh, veces: 0 };
      conteo[clave].veces += 1;
    });
    return Object.values(conteo).sort((a, b) => b.veces - a.veces).slice(0, 10);
  }, [tickets, clientes]);

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-slate-800">
        <Car size={17} />
        <h2 className="font-semibold text-sm">Vehículos que más vienen al local</h2>
      </div>
      <p className="text-xs text-slate-400">Basado en el campo "Vehículo" de cada cliente, útil para saber qué filtros conviene tener siempre en stock.</p>
      {ranking.length === 0 ? (
        <EmptyState text="Todavía no hay suficientes datos de vehículos." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {ranking.map((r, i) => (
            <li key={r.nombre} className="py-2 flex items-center justify-between text-sm">
              <span className="text-slate-700">
                <span className="text-slate-400 mr-1.5">#{i + 1}</span>
                {r.nombre}
              </span>
              <span className="font-semibold text-slate-800">{r.veces} {r.veces === 1 ? "visita" : "visitas"}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function CierresGuardados({ cierres }) {
  const ordenados = useMemo(() => [...(cierres || [])].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).slice(0, 15), [cierres]);
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-slate-800">
        <Receipt size={17} />
        <h2 className="font-semibold text-sm">Cierres de caja guardados</h2>
      </div>
      {ordenados.length === 0 ? (
        <EmptyState text="Todavía no se ha cerrado ninguna caja." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {ordenados.map((c) => (
            <li key={c.id} className="py-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">{c.fecha}</span>
                <span className="font-semibold text-slate-800">Neto: {soles(c.neto)}</span>
              </div>
              <p className="text-xs text-slate-400">
                Efectivo {soles(c.efectivo)} · Yape {soles(c.yape)} · Tarjeta {soles(c.tarjeta)} · Gastos {soles(c.totalGastos)} · Cerrado por {c.cerradoPor}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function RespaldoDatos({ clientes = [], tickets = [], ventas = [], cierres = [] }) {
  const [descargando, setDescargando] = useState(false);

  const descargar = async () => {
    setDescargando(true);
    try {
      const datos = {};
      for (const [nombre, key] of Object.entries(KEYS)) {
        try {
          const res = await window.storage.get(key, false);
          datos[nombre] = res ? JSON.parse(res.value) : [];
        } catch {
          datos[nombre] = [];
        }
      }
      // clientes, tickets y ventas ahora viven en tablas propias (no en kv_store):
      // el respaldo usa la información que la app tiene en memoria, que es la
      // que se lee de esas tablas, para que la copia quede completa.
      datos.clientes = clientes;
      datos.tickets = tickets;
      datos.ventas = ventas;
      datos.cierres = cierres;
      datos._generadoEn = new Date().toISOString();
      const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `maxwash-respaldo-${hoy()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDescargando(false);
    }
  };

  return (
    <Card className="p-4 space-y-2">
      <h2 className="font-semibold text-slate-800 text-sm">Copia de seguridad</h2>
      <p className="text-xs text-slate-400">
        Descarga un archivo con toda la información de tu negocio (clientes, ventas, cuentas, inventario, cierres de caja, etc.) para guardarlo aparte, por si acaso.
      </p>
      <button
        onClick={descargar}
        disabled={descargando}
        className="w-full bg-slate-800 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {descargando ? "Preparando archivo…" : "Descargar respaldo completo"}
      </button>
    </Card>
  );
}

function Dashboard({ cerradasHoy, abiertas, ventasHoy, ingresosHoy, propinasHoy, gastosTotalHoy, clientes, lavadores, tipos, stockBajoTienda, stockBajoAceite, valorInventarioTotal, irACuentas }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Ingresos hoy" value={soles(ingresosHoy)} icon={Wallet} tone="teal" />
        <StatCard label="Propinas hoy" value={soles(propinasHoy)} icon={Sparkles} tone="amber" />
        <StatCard label="Gastos hoy" value={soles(gastosTotalHoy)} icon={Receipt} tone="rose" />
        <StatCard label="Lavadas cobradas hoy" value={cerradasHoy.length} icon={Car} tone="slate" />
      </div>

      <StatCard label="Valor real invertido en inventario (tienda + aceite)" value={soles(valorInventarioTotal)} icon={Store} tone="violet" />

      {abiertas.length > 0 && (
        <button onClick={irACuentas} className="w-full text-left">
          <Card className="p-4 border-amber-300 bg-amber-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ClipboardList size={18} />
            </div>
            <div>
              <p className="font-semibold text-sm text-amber-800">{abiertas.length} cuenta{abiertas.length > 1 ? "s" : ""} abierta{abiertas.length > 1 ? "s" : ""}</p>
              <p className="text-xs text-amber-700">Clientes en el local, aún sin cobrar. Toca para gestionarlas.</p>
            </div>
          </Card>
        </button>
      )}

      {(stockBajoTienda.length > 0 || stockBajoAceite.length > 0) && (
        <Card className="p-4 border-rose-300 bg-rose-50">
          <div className="flex items-center gap-2 mb-2 text-rose-700">
            <AlertTriangle size={16} />
            <h2 className="font-semibold text-sm">Stock bajo</h2>
          </div>
          {stockBajoTienda.length > 0 && (
            <div className="mb-2">
              <p className="text-[11px] font-semibold text-rose-600 uppercase mb-1">Tienda</p>
              <ul className="space-y-1">
                {stockBajoTienda.map((p) => (
                  <li key={p.id} className="text-xs text-rose-800 flex justify-between">
                    <span>{p.nombre}</span><span>quedan {p.stock} · mínimo {p.stockMinimo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {stockBajoAceite.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-rose-600 uppercase mb-1">Cambio de aceite</p>
              <ul className="space-y-1">
                {stockBajoAceite.map((p) => (
                  <li key={p.id} className="text-xs text-rose-800 flex justify-between">
                    <span>{p.nombre} ({p.codigo})</span><span>quedan {p.stock} · mínimo {p.stockMinimo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      <Card className="p-4">
        <h2 className="font-semibold text-slate-800 mb-3 text-sm">Lavadas cobradas hoy</h2>
        {cerradasHoy.length === 0 ? (
          <EmptyState text="Aún no cobras ninguna cuenta hoy." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {[...cerradasHoy].reverse().map((t) => {
              const cliente = clientes.find((c) => c.id === t.clienteId);
              const lavador = lavadores.find((l) => l.id === t.lavadorId);
              const tipo = tipos.find((tp) => tp.id === t.tipoId);
              return (
                <li key={t.id} className="py-2.5 flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate flex items-center gap-1.5">
                      {cliente ? cliente.nombre : "Cliente eventual"} · {tipo?.nombre || "—"}
                      {t.gratis && <Gift size={13} className="text-violet-600" />}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      Lavador: {lavador ? lavador.nombre : "—"} · Propina {soles(t.propina)} · {PAGOS.find((p) => p.id === t.formaPago)?.label || "Efectivo"}
                    </p>
                  </div>
                  <span className="font-bold text-teal-700 shrink-0 ml-2">{t.gratis ? "GRATIS" : soles(t.total)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {ventasHoy.length > 0 && (
        <Card className="p-4">
          <h2 className="font-semibold text-slate-800 mb-3 text-sm">Ventas de mostrador en tienda hoy</h2>
          <ul className="divide-y divide-slate-100">
            {[...ventasHoy].reverse().map((v) => (
              <li key={v.id} className="py-2 flex justify-between text-sm">
                <span className="text-slate-700">{v.nombreProducto} × {v.cantidad}</span>
                <span className="font-semibold text-teal-700">{soles(v.total)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="text-xs text-slate-400 text-center">
        {clientes.length} clientes · {lavadores.length} lavadores registrados
      </p>
    </>
  );
}

function AbrirCuenta({ clientes, setClientes, lavadores, tipos, tickets, setTickets, notify, onAbierta }) {
  const [clienteId, setClienteId] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [nuevoCliente, setNuevoCliente] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [placaNuevo, setPlacaNuevo] = useState("");
  const [tipoId, setTipoId] = useState(tipos[0]?.id || "");
  const [lavadorId, setLavadorId] = useState("");

  const prevCount = clienteId && !nuevoCliente ? contarLavadas(tickets, clienteId) : 0;
  const esGratis = clienteId && !nuevoCliente && prevCount % CICLO_PROMO === CICLO_PROMO - 1;

  const abrir = async () => {
    if (!tipoId) return notify("Elige un tipo de lavado");
    let finalClienteId = clienteId;

    if (nuevoCliente) {
      if (!nombreNuevo.trim()) return notify("Escribe el nombre del cliente");
      const c = { id: uid(), nombre: nombreNuevo.trim(), telefono: "", placa: placaNuevo.trim(), vehiculo: "", foto: "", fecha: new Date().toISOString() };
      await setClientes([...clientes, c]);
      finalClienteId = c.id;
    }

    const ticket = {
      id: uid(),
      clienteId: finalClienteId || null,
      tipoId,
      extraIds: [],
      lavadorId: lavadorId || null,
      productos: [],
      repuestos: [],
      propina: 0,
      formaPago: "efectivo",
      estado: "abierto",
      fecha: new Date().toISOString(),
    };
    await setTickets([...tickets, ticket]);
    notify("Cuenta abierta. Ahora puedes agregarle extras, cambio de aceite o productos antes de cobrar.");
    setClienteId("");
    setBusqueda("");
    setNuevoCliente(false);
    setNombreNuevo("");
    setPlacaNuevo("");
    setLavadorId("");
    onAbierta(ticket.id);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-1 bg-teal-50 border-teal-200">
        <p className="text-sm text-teal-800">
          Abre la cuenta del cliente apenas elija su lavada. Podrás agregarle extras, cambio de aceite o productos de la tienda después, y cobrar todo junto al final.
        </p>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-sm">Cliente</h2>
          <button onClick={() => setNuevoCliente((v) => !v)} className="text-xs font-medium text-teal-700">
            {nuevoCliente ? "Elegir existente" : "+ Cliente nuevo"}
          </button>
        </div>
        {nuevoCliente ? (
          <div className="grid grid-cols-2 gap-2">
            <Field label="Nombre">
              <input className={inputCls} value={nombreNuevo} onChange={(e) => setNombreNuevo(e.target.value)} placeholder="Nombre del cliente" />
            </Field>
            <Field label="Placa (opcional)">
              <div className="flex gap-1.5">
                <input className={inputCls} value={placaNuevo} onChange={(e) => setPlacaNuevo(e.target.value.toUpperCase())} placeholder="ABC-123" />
                <button
                  type="button"
                  onClick={() => buscarPlacaEnSunarp(placaNuevo, notify)}
                  className="shrink-0 rounded-lg border border-teal-300 text-teal-700 px-2 py-2 text-xs font-medium flex items-center gap-1"
                  title="Buscar marca y modelo en la consulta oficial de SUNARP"
                >
                  <Search size={13} /> SUNARP
                </button>
              </div>
            </Field>
          </div>
        ) : clienteId ? (
          (() => {
            const c = clientes.find((x) => x.id === clienteId);
            return (
              <div className="flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50 p-2.5">
                {c?.foto ? (
                  <img src={c.foto} alt={c.nombre} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-teal-300 shrink-0">
                    <Car size={18} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800 text-sm truncate">{c?.nombre || "Cliente"}</p>
                  <p className="text-xs text-slate-500 truncate">{[c?.placa, c?.vehiculo].filter(Boolean).join(" · ") || "Sin datos"}</p>
                </div>
                <button
                  onClick={() => { setClienteId(""); setBusqueda(""); }}
                  className="text-xs font-medium text-teal-700 border border-teal-300 rounded-lg px-2.5 py-1.5 shrink-0"
                >
                  Cambiar
                </button>
              </div>
            );
          })()
        ) : (
          <>
            <Field label="Buscar por placa o nombre">
              <input
                className={inputCls}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Ej. ABU-310 o José"
                autoFocus={false}
              />
            </Field>
            {busqueda.trim() ? (
              (() => {
                const q = busqueda.trim().toLowerCase();
                const resultados = clientes
                  .filter((c) => (c.placa || "").toLowerCase().includes(q) || (c.nombre || "").toLowerCase().includes(q))
                  .slice(0, 8);
                if (resultados.length === 0) {
                  return <p className="text-xs text-slate-400">Sin resultados. Puedes registrarlo con "+ Cliente nuevo".</p>;
                }
                return (
                  <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    {resultados.map((c) => (
                      <li key={c.id}>
                        <button
                          onClick={() => { setClienteId(c.id); setBusqueda(""); }}
                          className="w-full flex items-center gap-3 p-2.5 text-left hover:bg-slate-50"
                        >
                          {c.foto ? (
                            <img src={c.foto} alt={c.nombre} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 shrink-0">
                              <Car size={16} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-800 text-sm truncate">{c.nombre}</p>
                            <p className="text-xs text-slate-400 truncate">{[c.placa, c.vehiculo].filter(Boolean).join(" · ") || "Sin datos"}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                );
              })()
            ) : (
              <button onClick={() => setClienteId("")} className="text-xs text-slate-400 underline">
                Continuar como cliente eventual (sin buscar)
              </button>
            )}
          </>
        )}
        {clienteId && !nuevoCliente && (
          <p className={`text-xs font-medium ${esGratis ? "text-violet-700" : "text-slate-500"}`}>
            {esGratis ? "🎁 ¡Esta será su 7ma lavada — va GRATIS por promoción!" : `Lleva ${prevCount % CICLO_PROMO} de ${CICLO_PROMO} lavadas para la próxima gratis.`}
          </p>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="font-semibold text-slate-800 text-sm">Tipo de lavado</h2>
        {tipos.length === 0 ? (
          <EmptyState text="Agrega tipos de lavado en Catálogo." />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {tipos.map((t) => (
              <button
                key={t.id}
                onClick={() => setTipoId(t.id)}
                className={`rounded-lg border px-3 py-2 text-left text-sm ${
                  tipoId === t.id ? "border-teal-600 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-600"
                }`}
              >
                <p className="font-medium truncate">{t.nombre}</p>
                <p className="text-xs">{soles(t.precio)}</p>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <Field label="Lavador que realizó el servicio (puedes dejarlo pendiente)">
          <select className={inputCls} value={lavadorId} onChange={(e) => setLavadorId(e.target.value)}>
            <option value="">Sin asignar</option>
            {lavadores.map((l) => (
              <option key={l.id} value={l.id}>{l.nombre}</option>
            ))}
          </select>
        </Field>
      </Card>

      <button onClick={abrir} className="w-full bg-teal-600 text-white rounded-lg py-3 text-sm font-semibold shadow-sm">
        Abrir cuenta
      </button>
    </div>
  );
}

function BienvenidaBanner({ pendiente, clientes, onEnviar, onCerrar }) {
  const c = clientes.find((x) => x.id === pendiente.clienteId);
  if (!c) return null;
  return (
    <Card className="p-4 space-y-2 bg-emerald-50 border-emerald-300">
      <p className="text-sm font-semibold text-emerald-900">Cuenta cobrada: ¿mando la bienvenida a {c.nombre}?</p>
      <p className="text-xs text-emerald-800">
        Se abre WhatsApp con el mensaje listo pidiendo tu reseña en Google Maps y el seguimiento en TikTok. Solo la envías una vez por cliente.
      </p>
      <div className="flex gap-2">
        <button onClick={onEnviar} className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-1.5">
          <MessageCircle size={15} /> Enviar bienvenida por WhatsApp
        </button>
        <button onClick={onCerrar} className="shrink-0 px-3 py-2 text-sm text-emerald-800 bg-white border border-emerald-300 rounded-lg">
          Ahora no
        </button>
      </div>
    </Card>
  );
}

function Cuentas({ abiertas, focusTicketId, clearFocus, clientes, setClientes, lavadores, tipos, extras, productos, setProductos, repuestos, setRepuestos, tickets, setTickets, notify }) {
  const [abiertoId, setAbiertoId] = useState(null);
  const [pendienteBienvenida, setPendienteBienvenida] = useState(null);

  useEffect(() => {
    if (focusTicketId) {
      setAbiertoId(focusTicketId);
      clearFocus();
    }
  }, [focusTicketId]);

  const onCobrado = (t) => {
    const c = clientes.find((x) => x.id === t.clienteId);
    if (c && telParaWhatsApp(c.telefono) && !c.saludoEnviado) {
      setPendienteBienvenida({ clienteId: c.id, hora: Date.now() });
    }
  };

  const enviarBienvenida = () => {
    const c = clientes.find((x) => x.id === pendienteBienvenida.clienteId);
    if (!c) return;
    const wa = telParaWhatsApp(c.telefono);
    const msg = MENSAJE_BIENVENIDA_DEFAULT.replace(/\{nombre\}/g, c.nombre || "cliente");
    window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    setClientes(clientes.map((x) => (x.id === c.id ? { ...x, saludoEnviado: true } : x)));
    setPendienteBienvenida(null);
  };

  if (abiertas.length === 0) {
    return (
      <div className="space-y-3">
        {pendienteBienvenida && <BienvenidaBanner pendiente={pendienteBienvenida} clientes={clientes} onEnviar={enviarBienvenida} onCerrar={() => setPendienteBienvenida(null)} />}
        <Card className="p-6 text-center text-sm">
          <p className="text-slate-400">No hay cuentas abiertas. Ábrelas desde "Abrir cuenta" cuando llegue un cliente.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendienteBienvenida && <BienvenidaBanner pendiente={pendienteBienvenida} clientes={clientes} onEnviar={enviarBienvenida} onCerrar={() => setPendienteBienvenida(null)} />}
      {abiertas.map((t) => (
        <CuentaCard
          key={t.id}
          ticket={t}
          expanded={abiertoId === t.id}
          onToggle={() => setAbiertoId(abiertoId === t.id ? null : t.id)}
          clientes={clientes}
          lavadores={lavadores}
          tipos={tipos}
          extras={extras}
          productos={productos}
          setProductos={setProductos}
          repuestos={repuestos}
          setRepuestos={setRepuestos}
          tickets={tickets}
          setTickets={setTickets}
          onCobrado={onCobrado}
          notify={notify}
        />
      ))}
    </div>
  );
}

function CuentaCard({ ticket, expanded, onToggle, clientes, lavadores, tipos, extras, productos, setProductos, repuestos, setRepuestos, tickets, setTickets, onCobrado, notify }) {
  const cliente = clientes.find((c) => c.id === ticket.clienteId);
  const tipo = tipos.find((t) => t.id === ticket.tipoId);
  const extrasSel = extras.filter((e) => (ticket.extraIds || []).includes(e.id));
  const productosTotal = (ticket.productos || []).reduce((s, p) => s + p.total, 0);
  const repuestosTotal = (ticket.repuestos || []).reduce((s, p) => s + p.total, 0);
  const subtotal = (tipo?.precio || 0) + extrasSel.reduce((s, e) => s + Number(e.precio), 0) + productosTotal + repuestosTotal;

  const prevCount = ticket.clienteId ? contarLavadas(tickets, ticket.clienteId) : 0;
  const esGratis = !!ticket.clienteId && prevCount % CICLO_PROMO === CICLO_PROMO - 1;
  const total = esGratis ? Number(ticket.propina || 0) : subtotal + Number(ticket.propina || 0);

  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [repuestoId, setRepuestoId] = useState("");
  const [cantidadAceite, setCantidadAceite] = useState("1");
  const [dividido, setDividido] = useState(false);
  const [montos, setMontos] = useState({ efectivo: "", yape: "", tarjeta: "" });

  const sumaDividido = Number(montos.efectivo || 0) + Number(montos.yape || 0) + Number(montos.tarjeta || 0);
  const diferenciaDividido = Math.round((total - sumaDividido) * 100) / 100;

  const updateTicket = (patch) => setTickets(tickets.map((t) => (t.id === ticket.id ? { ...t, ...patch } : t)));

  const toggleExtra = (id) => {
    const ids = ticket.extraIds || [];
    const nuevos = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    updateTicket({ extraIds: nuevos });
  };

  const agregarProducto = async () => {
    const prod = productos.find((p) => p.id === productoId);
    const cant = Number(cantidad || 0);
    if (!prod) return notify("Elige un producto");
    if (cant <= 0) return notify("Cantidad inválida");
    if (cant > prod.stock) return notify(`Solo quedan ${prod.stock} unidades de ${prod.nombre}`);

    await setProductos(productos.map((p) => (p.id === prod.id ? { ...p, stock: p.stock - cant } : p)));
    const item = { id: uid(), productoId: prod.id, nombre: prod.nombre, cantidad: cant, precioUnit: prod.precio, total: prod.precio * cant };
    await setTickets(tickets.map((t) => (t.id === ticket.id ? { ...t, productos: [...(t.productos || []), item] } : t)));
    setProductoId("");
    setCantidad("1");
    notify(`${prod.nombre} agregado a la cuenta`);
  };

  const quitarProducto = async (item) => {
    await setProductos(productos.map((p) => (p.id === item.productoId ? { ...p, stock: p.stock + item.cantidad } : p)));
    await setTickets(tickets.map((t) => (t.id === ticket.id ? { ...t, productos: t.productos.filter((x) => x.id !== item.id) } : t)));
  };

  const agregarRepuesto = async () => {
    const rep = repuestos.find((r) => r.id === repuestoId);
    const cant = Number(cantidadAceite || 0);
    if (!rep) return notify("Elige un producto de cambio de aceite");
    if (cant <= 0) return notify("Cantidad inválida");
    if (cant > rep.stock) return notify(`Solo quedan ${rep.stock} unidades de ${rep.nombre}`);

    await setRepuestos(repuestos.map((r) => (r.id === rep.id ? { ...r, stock: r.stock - cant } : r)));
    const item = { id: uid(), repuestoId: rep.id, categoria: rep.categoria, nombre: rep.nombre, codigo: rep.codigo, cantidad: cant, precioUnit: rep.precio, total: rep.precio * cant };
    await setTickets(tickets.map((t) => (t.id === ticket.id ? { ...t, repuestos: [...(t.repuestos || []), item] } : t)));
    setRepuestoId("");
    setCantidadAceite("1");
    notify(`${rep.nombre} agregado a la cuenta`);
  };

  const quitarRepuesto = async (item) => {
    await setRepuestos(repuestos.map((r) => (r.id === item.repuestoId ? { ...r, stock: r.stock + item.cantidad } : r)));
    await setTickets(tickets.map((t) => (t.id === ticket.id ? { ...t, repuestos: t.repuestos.filter((x) => x.id !== item.id) } : t)));
  };

  const cancelarCuenta = async () => {
    if ((ticket.productos || []).length) {
      const restos = ticket.productos;
      await setProductos(productos.map((p) => {
        const item = restos.find((r) => r.productoId === p.id);
        return item ? { ...p, stock: p.stock + item.cantidad } : p;
      }));
    }
    if ((ticket.repuestos || []).length) {
      const restos = ticket.repuestos;
      await setRepuestos(repuestos.map((r) => {
        const item = restos.find((x) => x.repuestoId === r.id);
        return item ? { ...r, stock: r.stock + item.cantidad } : r;
      }));
    }
    await setTickets(tickets.filter((t) => t.id !== ticket.id));
    notify("Cuenta cancelada");
  };

  const cobrar = async () => {
    if (dividido && !esGratis && Math.abs(diferenciaDividido) > 0.01) {
      notify(`Los montos no cuadran: falta ${soles(diferenciaDividido)}`);
      return;
    }
    const pagos = dividido && !esGratis
      ? PAGOS.map((p) => ({ metodo: p.id, monto: Number(montos[p.id] || 0) })).filter((p) => p.monto > 0)
      : undefined;
    await setTickets(
      tickets.map((t) =>
        t.id === ticket.id
          ? { ...t, estado: "cerrado", subtotal, total, gratis: esGratis, fechaCobro: new Date().toISOString(), ...(pagos ? { pagos } : {}) }
          : t
      )
    );
    notify(esGratis ? "¡Cuenta cobrada — lavada gratis por promoción!" : "Cuenta cobrada");
    onCobrado(ticket);
  };

  return (
    <Card className={`overflow-hidden ${esGratis ? "border-violet-300" : ""}`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 text-left">
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate flex items-center gap-1.5">
            {cliente ? cliente.nombre : "Cliente eventual"} · {tipo?.nombre || "—"}
            {esGratis && <Gift size={13} className="text-violet-600" />}
          </p>
          <p className="text-xs text-slate-400">
            Abierta {fmtHora(ticket.fecha)} · {extrasSel.length} extra{extrasSel.length !== 1 ? "s" : ""} · {(ticket.productos || []).length} prod. · {(ticket.repuestos || []).length} aceite/filtro
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="font-bold text-teal-700 text-sm">{soles(subtotal)}</span>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Tipo de lavado">
              <select className={inputCls} value={ticket.tipoId} onChange={(e) => updateTicket({ tipoId: e.target.value })}>
                {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre} · {soles(t.precio)}</option>)}
              </select>
            </Field>
            <Field label="Lavador">
              <select className={inputCls} value={ticket.lavadorId || ""} onChange={(e) => updateTicket({ lavadorId: e.target.value || null })}>
                <option value="">Sin asignar</option>
                {lavadores.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
            </Field>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-600 mb-1">Extras</span>
            {extras.length === 0 ? (
              <p className="text-xs text-slate-400">Sin extras en el catálogo.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {extras.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => toggleExtra(e.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      (ticket.extraIds || []).includes(e.id) ? "border-teal-600 bg-teal-600 text-white" : "border-slate-300 text-slate-600"
                    }`}
                  >
                    {e.nombre} · {soles(e.precio)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
            <span className="block text-xs font-semibold text-amber-800 mb-1.5 flex items-center gap-1"><Wrench size={13} /> Cambio de aceite</span>
            {(ticket.repuestos || []).length > 0 && (
              <ul className="mb-2 divide-y divide-amber-100 border border-amber-100 bg-white rounded-lg overflow-hidden">
                {ticket.repuestos.map((item) => (
                  <li key={item.id} className="flex items-center justify-between px-2.5 py-1.5 text-xs">
                    <span className="text-slate-700">
                      <span className="text-amber-700 font-medium">{item.categoria}:</span> {item.nombre} <span className="text-slate-400">({item.codigo})</span> × {item.cantidad}
                    </span>
                    <span className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="font-medium text-slate-700">{soles(item.total)}</span>
                      <button onClick={() => quitarRepuesto(item)} className="text-slate-300 hover:text-rose-500"><X size={14} /></button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {repuestos.length === 0 ? (
              <p className="text-xs text-amber-700">Aún no registras aceites ni filtros. Agrégalos en la pestaña "Cambio de aceite".</p>
            ) : (
              <div className="flex gap-2">
                <select className={`${inputCls} flex-1`} value={repuestoId} onChange={(e) => setRepuestoId(e.target.value)}>
                  <option value="">Elegir aceite / filtro</option>
                  {CATEGORIAS_ACEITE.map((cat) => {
                    const items = repuestos.filter((r) => r.categoria === cat);
                    if (items.length === 0) return null;
                    return (
                      <optgroup key={cat} label={cat}>
                        {items.map((r) => (
                          <option key={r.id} value={r.id}>{r.nombre} ({r.codigo}) · {soles(r.precio)} · quedan {r.stock}</option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
                <input type="number" min="1" className={`${inputCls} w-16`} value={cantidadAceite} onChange={(e) => setCantidadAceite(e.target.value)} />
                <button onClick={agregarRepuesto} className="shrink-0 rounded-lg bg-amber-500 text-white px-3"><Plus size={16} /></button>
              </div>
            )}
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1"><ShoppingBag size={13} /> Productos de la tienda</span>
            {(ticket.productos || []).length > 0 && (
              <ul className="mb-2 divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                {ticket.productos.map((item) => (
                  <li key={item.id} className="flex items-center justify-between px-2.5 py-1.5 text-xs">
                    <span className="text-slate-700">{item.nombre} × {item.cantidad}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{soles(item.total)}</span>
                      <button onClick={() => quitarProducto(item)} className="text-slate-300 hover:text-rose-500"><X size={14} /></button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {productos.length === 0 ? (
              <p className="text-xs text-slate-400">Aún no tienes productos en la tienda.</p>
            ) : (
              <div className="flex gap-2">
                <select className={`${inputCls} flex-1`} value={productoId} onChange={(e) => setProductoId(e.target.value)}>
                  <option value="">Elegir producto</option>
                  {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre} · {soles(p.precio)} · quedan {p.stock}</option>)}
                </select>
                <input type="number" min="1" className={`${inputCls} w-16`} value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                <button onClick={agregarProducto} className="shrink-0 rounded-lg bg-teal-600 text-white px-3"><Plus size={16} /></button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Propina (S/)">
              <input type="number" min="0" step="0.5" className={inputCls} value={ticket.propina} onChange={(e) => updateTicket({ propina: Number(e.target.value || 0) })} />
            </Field>
            {!dividido && (
              <Field label="Forma de pago">
                <select className={inputCls} value={ticket.formaPago} onChange={(e) => updateTicket({ formaPago: e.target.value })}>
                  {PAGOS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </Field>
            )}
          </div>

          <button
            type="button"
            onClick={() => setDividido((d) => !d)}
            className="text-xs font-medium text-teal-700 underline"
          >
            {dividido ? "Usar un solo método de pago" : "¿Pagó con 2 métodos distintos? Dividir el pago"}
          </button>

          {dividido && (
            <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-3 space-y-2">
              <p className="text-xs text-teal-800">Ingresa cuánto pagó con cada método (deben sumar el total):</p>
              <div className="grid grid-cols-3 gap-2">
                {PAGOS.map((p) => (
                  <Field key={p.id} label={p.label}>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className={inputCls}
                      value={montos[p.id]}
                      onChange={(e) => setMontos((m) => ({ ...m, [p.id]: e.target.value }))}
                    />
                  </Field>
                ))}
              </div>
              <p className={`text-xs font-medium ${Math.abs(diferenciaDividido) > 0.01 ? "text-rose-600" : "text-teal-700"}`}>
                {Math.abs(diferenciaDividido) > 0.01
                  ? diferenciaDividido > 0
                    ? `Falta ${soles(diferenciaDividido)} para completar el total`
                    : `Te pasaste por ${soles(Math.abs(diferenciaDividido))}`
                  : "✓ Los montos cuadran con el total"}
              </p>
            </div>
          )}

          {ticket.clienteId && (
            <p className={`text-xs font-medium ${esGratis ? "text-violet-700" : "text-slate-500"}`}>
              {esGratis ? "🎁 Esta cuenta va GRATIS por promoción (7ma lavada)." : `Lleva ${prevCount % CICLO_PROMO} de ${CICLO_PROMO} lavadas para la próxima gratis.`}
            </p>
          )}

          <div className={`rounded-lg p-3 ${esGratis ? "bg-violet-50 border border-violet-200" : "bg-slate-50 border border-slate-200"}`}>
            <div className="flex justify-between text-xs text-slate-500"><span>Subtotal (lavado + extras + aceite + productos)</span><span>{esGratis ? <s>{soles(subtotal)}</s> : soles(subtotal)}</span></div>
            <div className="flex justify-between text-xs text-slate-500"><span>Propina</span><span>{soles(ticket.propina || 0)}</span></div>
            <div className={`flex justify-between font-bold text-base mt-1 pt-1 border-t ${esGratis ? "text-violet-700 border-violet-200" : "text-teal-700 border-slate-200"}`}>
              <span>Total a cobrar</span><span>{esGratis ? "GRATIS 🎁" : soles(total)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={cancelarCuenta} className="rounded-lg border border-rose-200 text-rose-600 px-3 py-2.5 text-sm font-medium">
              Cancelar
            </button>
            <button
              onClick={cobrar}
              disabled={dividido && !esGratis && Math.abs(diferenciaDividido) > 0.01}
              className="flex-1 bg-teal-600 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              Cobrar {esGratis ? "(gratis)" : soles(total)}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Clientes({ clientes, setClientes, tickets, notify }) {
  const vacio = { nombre: "", telefono: "", placa: "", vehiculo: "", foto: "" };
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);

  const MENSAJE_PROMO_DEFAULT =
    "Hola {nombre}! En MaxWash D'Durand tenemos una promoción especial esta semana para cuidar tu carro. ¡Ven y aprovecha, te esperamos!";
  const [promoMsg, setPromoMsg] = useState(MENSAJE_PROMO_DEFAULT);
  const [bienvenidaMsg, setBienvenidaMsg] = useState(MENSAJE_BIENVENIDA_DEFAULT);

  const enviarWhatsApp = (c) => {
    const wa = telParaWhatsApp(c.telefono);
    if (!wa) return notify("Este cliente no tiene teléfono");
    const msg = promoMsg.replace(/\{nombre\}/g, c.nombre || "cliente");
    window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
  };

  // Copia todos los teléfonos al pasar los números a WhatsApp, útil para crear
  // una "lista de difusión" (comunidad) y mandar la promoción a todos de una vez.
  const copiarNumeros = async () => {
    const conTel = clientes.filter((c) => telParaWhatsApp(c.telefono));
    if (!conTel.length) return notify("No hay clientes con teléfono guardado");
    const lista = conTel.map((c) => `${c.nombre}: +${telParaWhatsApp(c.telefono)}`).join("\n");
    try {
      await navigator.clipboard.writeText(lista);
      notify("Lista copiada: pégala en WhatsApp y crea tu lista de difusión");
    } catch {
      notify("No se pudo copiar. Selecciona los números y usa Copiar en tu teléfono");
    }
  };

  const copiarResena = async () => {
    try {
      await navigator.clipboard.writeText(LINKS_NEGOCIO.google);
      notify("Link de reseña copiado: envíaselo y el cliente llega directo a escribir la reseña");
    } catch {
      notify("No se pudo copiar el link");
    }
  };

  const limpiarForm = () => {
    setForm(vacio);
    setEditId(null);
  };

  const cambiarSegmento = async (c, segmento) => {
    await setClientes(clientes.map((x) => (x.id === c.id ? { ...x, segmento } : x)));
    notify(segmento ? `Cliente marcado como ${segmento}` : "Grupo quitado");
  };

  const guardar = async () => {
    if (!form.nombre.trim()) return notify("Escribe el nombre del cliente");
    if (editId) {
      await setClientes(clientes.map((c) => (c.id === editId ? { ...c, ...form, nombre: form.nombre.trim() } : c)));
      notify("Cliente actualizado");
    } else {
      await setClientes([...clientes, { id: uid(), ...form, nombre: form.nombre.trim(), fecha: new Date().toISOString() }]);
      notify("Cliente registrado");
    }
    limpiarForm();
  };

  const editar = (c) => {
    setEditId(c.id);
    setForm({ nombre: c.nombre || "", telefono: c.telefono || "", placa: c.placa || "", vehiculo: c.vehiculo || "", foto: c.foto || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    await setClientes(clientes.filter((c) => c.id !== id));
    if (editId === id) limpiarForm();
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-sm">{editId ? "Editar cliente" : "Registrar cliente"}</h2>
          {editId && (
            <button onClick={limpiarForm} className="text-xs text-slate-400 hover:text-slate-600">
              Cancelar edición
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Nombre"><input className={inputCls} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field>
          <Field label="Teléfono"><input className={inputCls} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></Field>
          <Field label="Placa">
            <div className="flex gap-1.5">
              <input className={inputCls} value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })} />
              <button
                type="button"
                onClick={() => buscarPlacaEnSunarp(form.placa, notify)}
                className="shrink-0 rounded-lg border border-teal-300 text-teal-700 px-2 py-2 text-xs font-medium flex items-center gap-1"
                title="Buscar marca y modelo en la consulta oficial de SUNARP"
              >
                <Search size={13} /> SUNARP
              </button>
            </div>
          </Field>
          <Field label="Vehículo"><input className={inputCls} value={form.vehiculo} onChange={(e) => setForm({ ...form, vehiculo: e.target.value })} placeholder="Marca / modelo" /></Field>
        </div>
        <button onClick={guardar} className="w-full bg-teal-600 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5">
          {editId ? "Guardar cambios" : (<><Plus size={16} /> Guardar cliente</>)}
        </button>
      </Card>

      <Card className="p-4 space-y-3 bg-teal-50 border-teal-200">
        <div className="flex items-center gap-2">
          <MessageCircle size={17} className="text-teal-700" />
          <h2 className="font-semibold text-sm text-teal-900">Promoción por WhatsApp</h2>
        </div>
        <p className="text-xs text-teal-800">
          Edita el mensaje y usa {"{nombre}"} para que salga el nombre de cada cliente. Después toca el botón verde de WhatsApp en cada cliente (su chat se abre con el mensaje listo), o copia la lista de números para armar una lista de difusión.
        </p>
        <textarea
          className="w-full rounded-lg border border-teal-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          rows={3}
          value={promoMsg}
          onChange={(e) => setPromoMsg(e.target.value)}
        />
        <p className="text-xs font-medium text-teal-900 mt-1">Mensaje de bienvenida (cliente nuevo)</p>
        <textarea
          className="w-full rounded-lg border border-teal-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          rows={4}
          value={bienvenidaMsg}
          onChange={(e) => setBienvenidaMsg(e.target.value)}
        />
        <p className="text-[11px] text-teal-700">
          La bienvenida se envía al cobrar la cuenta del cliente: pide tu reseña en Google Maps y que te sigan en TikTok. Puedes usarla en la lista de clientes con el botón verde, o se ofrecerá sola al cobrar una cuenta.
        </p>
        <div className="rounded-lg bg-white border border-teal-200 p-2 text-[11px] text-teal-800">
          <p className="font-medium mb-1">Marca a cada cliente como grupo A, B o C</p>
          <p>Elige el grupo en la lista de clientes (junto a cada nombre) para enviar ofertas distintas a cada grupo.</p>
        </div>
        <button onClick={copiarNumeros} className="w-full bg-teal-600 text-white rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-1.5">
          <ClipboardList size={15} /> Copiar lista de números
        </button>
        <button onClick={copiarResena} className="w-full bg-white border border-teal-300 text-teal-700 rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-1.5">
          <Star size={15} /> Copiar link de reseña (Google)
        </button>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold text-slate-800 mb-2 text-sm">Clientes ({clientes.length})</h2>
        {clientes.length === 0 ? (
          <EmptyState text="Sin clientes registrados." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {[...clientes].reverse().map((c) => {
              const n = contarLavadas(tickets, c.id) % CICLO_PROMO;
              return (
                <li key={c.id} className="py-3 flex items-center gap-3 text-sm">
                  {c.foto ? (
                    <img src={c.foto} alt={c.nombre} className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 shrink-0">
                      <Car size={18} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 truncate flex items-center">
                      {c.nombre}
                      {c.segmento && (
                        <span
                          className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            c.segmento === "A"
                              ? "bg-violet-100 text-violet-700"
                              : c.segmento === "B"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {c.segmento}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {[c.placa, c.vehiculo, c.telefono].filter(Boolean).join(" · ") || "Sin datos adicionales"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                        <div className="h-full bg-violet-500" style={{ width: `${(n / CICLO_PROMO) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-violet-600 font-medium">{n}/{CICLO_PROMO}</span>
                    </div>
                  </div>
                  <button onClick={() => enviarWhatsApp(c)} className="text-[#25D366] hover:text-[#1da851] shrink-0" title="Enviar promoción por WhatsApp">
                    <MessageCircle size={18} />
                  </button>
                  <select
                    value={c.segmento || ""}
                    onChange={(e) => cambiarSegmento(c, e.target.value)}
                    className="shrink-0 rounded-lg border border-slate-200 text-xs px-1 py-1.5 text-slate-600 focus:outline-none"
                    title="Marcar grupo A, B o C"
                  >
                    <option value="">Grupo</option>
                    <option value="A">A - Fiel</option>
                    <option value="B">B - Regular</option>
                    <option value="C">C - Ocasional</option>
                  </select>
                  <button onClick={() => editar(c)} className="text-slate-300 hover:text-teal-600 shrink-0">
                    <Settings size={16} />
                  </button>
                  <button onClick={() => remove(c.id)} className="text-slate-300 hover:text-rose-500 shrink-0">
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function EditarListaPrecios({ titulo, items, campo, config, setConfig, nota }) {
  const esAceite = campo === "aceites";
  const campoPrecio = esAceite ? "costo" : "precio";
  const update = (nuevos) => setConfig({ ...config, [campo]: nuevos });

  return (
    <div className="rounded-lg border border-slate-200 p-2 space-y-2">
      <p className="text-xs font-semibold text-slate-700">
        {titulo} <span className="font-normal text-slate-400">({esAceite ? "tu costo por litro" : "precio de venta"})</span>
      </p>
      {nota && <p className="text-[11px] text-slate-400 -mt-1">{nota}</p>}
      {items.map((it, i) => (
        <div key={it.id} className="flex gap-1.5 items-center">
          <input
            className={inputCls}
            value={it.nombre}
            onChange={(e) => update(items.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))}
            placeholder="Nombre"
          />
          <input
            className={`${inputCls} w-20`}
            type="number"
            step="0.01"
            value={it[campoPrecio]}
            onChange={(e) => update(items.map((x, j) => (j === i ? { ...x, [campoPrecio]: e.target.value } : x)))}
          />
          <button onClick={() => update(items.filter((_, j) => j !== i))} className="text-slate-300 hover:text-rose-500 shrink-0">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button
        onClick={() => update([...items, { id: uid(), nombre: "", [campoPrecio]: "" }])}
        className="text-xs text-teal-700 font-medium flex items-center gap-1"
      >
        <Plus size={13} /> Agregar
      </button>
    </div>
  );
}

function EditarListaAceites({ aceites, utilidad, setConfig, buscar = "" }) {
  const update = (nuevos) => setConfig((cfg) => ({ ...cfg, aceites: nuevos }));
  const patch = (id, campo, valor) => update((aceites || []).map((x) => (x.id === id ? { ...x, [campo]: valor } : x)));
  const quitar = (id) => update((aceites || []).filter((x) => x.id !== id));
  const visibles = useMemo(() => {
    const t = norm(buscar.trim());
    return t ? (aceites || []).filter((a) => norm(a.nombre).includes(t)) : aceites || [];
  }, [aceites, buscar]);

  return (
    <div className="rounded-lg border border-slate-200 p-2 space-y-2">
      <p className="text-xs font-semibold text-slate-700">
        Aceites — <span className="font-normal text-slate-500">{visibles.length} de {(aceites || []).length}</span>
      </p>
      <p className="text-[11px] text-slate-400 -mt-1">
        Escribe lo que te cuesta el galón (4, 5 o 6 L). La app le suma la utilidad y redondea a múltiplo de 10.
      </p>
      {visibles.length === 0 && <p className="text-xs text-slate-400">No hay aceites con ese nombre.</p>}
      {visibles.map((a) => (
        <div key={a.id} className="flex gap-1.5 items-center">
          <input className={inputCls} value={a.nombre} onChange={(e) => patch(a.id, "nombre", e.target.value)} placeholder="Nombre" />
          <select className={`${inputCls} w-16`} value={a.capacidad} onChange={(e) => patch(a.id, "capacidad", Number(e.target.value))}>
            <option value={4}>4 L</option>
            <option value={5}>5 L</option>
            <option value={6}>6 L</option>
          </select>
          <input
            className={`${inputCls} w-20`}
            type="number"
            value={a.costo}
            onChange={(e) => patch(a.id, "costo", e.target.value)}
            placeholder="Costo"
          />
          <span className="text-[10px] text-teal-700 font-semibold w-14 shrink-0 text-right">= {soles(precioVentaEnvase(a.costo, utilidad))}</span>
          <button onClick={() => quitar(a.id)} className="text-slate-300 hover:text-rose-500 shrink-0">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button
        onClick={() => update([...(aceites || []), { id: uid(), nombre: "", capacidad: 4, costo: "" }])}
        className="text-xs text-teal-700 font-medium flex items-center gap-1"
      >
        <Plus size={13} /> Agregar aceite
      </button>
    </div>
  );
}

// Alta y baja de vehículos del catálogo (solo administrador): permite corregir
// los litros de un modelo o quitar los que no se usan.
function GestorVehiculos({ vehiculos, setConfig, notify }) {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [litros, setLitros] = useState("");
  const [tipo, setTipo] = useState("auto");
  const [buscar, setBuscar] = useState("");

  const agregar = () => {
    if (!marca.trim()) return notify("Escribe la marca del vehículo");
    const n = Number(litros);
    if (!n) return notify("Escribe los litros del vehículo");
    setConfig((cfg) => ({
      ...cfg,
      vehiculos: [
        { id: uid(), marca: marca.trim(), modelo: modelo.trim(), anio: anio.trim(), litros: n, tipo },
        ...(cfg.vehiculos || []),
      ],
    }));
    setMarca("");
    setModelo("");
    setAnio("");
    setLitros("");
    setTipo("auto");
  };

  const quitar = (v) => setConfig((cfg) => ({ ...cfg, vehiculos: (cfg.vehiculos || []).filter((x) => x.id !== v.id) }));

  const t = norm(buscar.trim());
  const visibles = t ? (vehiculos || []).filter((v) => norm(`${v.marca} ${v.modelo} ${v.anio}`).includes(t)) : vehiculos || [];

  return (
    <div className="rounded-lg border border-slate-200 p-2 space-y-2">
      <p className="text-xs font-semibold text-slate-700">Agregar vehículo al catálogo</p>
      <div className="grid grid-cols-2 gap-1.5">
        <input className={inputCls} value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Marca" />
        <input className={inputCls} value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Modelo" />
        <input className={inputCls} value={anio} onChange={(e) => setAnio(e.target.value)} placeholder="Año" />
        <input className={inputCls} type="number" step="0.1" value={litros} onChange={(e) => setLitros(e.target.value)} placeholder="Litros" />
      </div>
      <select className={inputCls} value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="auto">Auto</option>
        <option value="camioneta">Camioneta</option>
        <option value="suv">SUV</option>
        <option value="van">Van / furgón</option>
      </select>
      <button onClick={agregar} className="w-full bg-slate-800 text-white rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1">
        <Plus size={13} /> Agregar
      </button>

      <input className={inputCls} value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar en el catálogo..." />
      <ul className="space-y-1 max-h-64 overflow-y-auto">
        {visibles.map((v) => (
          <li key={v.id} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="truncate flex-1">
              {v.marca} {v.modelo} {v.anio} · {v.litros} L
            </span>
            <button onClick={() => quitar(v)} className="text-slate-300 hover:text-rose-500">
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function configCotCompleta(cfg) {
  const c = cfg || {};
  return {
    ...CONFIG_COT_DEFAULT,
    ...c,
    planes:
      Array.isArray(c.planes) && Number(c.versionCot) >= CONFIG_COT_DEFAULT.versionCot
        ? c.planes
        : CONFIG_COT_DEFAULT.planes,
    corteLitros: Number(c.corteLitros ?? CONFIG_COT_DEFAULT.corteLitros),
    recargoExtra: Number(c.recargoExtra ?? CONFIG_COT_DEFAULT.recargoExtra),
    tiposVehiculo: c.tiposVehiculo || CONFIG_COT_DEFAULT.tiposVehiculo,
    vehiculos: (c.vehiculos || []).length ? c.vehiculos : CONFIG_COT_DEFAULT.vehiculos,
    aceites: (c.aceites || []).length ? c.aceites : CONFIG_COT_DEFAULT.aceites,
  };
}

function PreciosAdmin({ configCotList, setConfigCotList, notify }) {
  const cfg = configCotCompleta((configCotList && configCotList[0]) || CONFIG_COT_DEFAULT);
  const setConfig = (fn) => setConfigCotList([typeof fn === "function" ? fn(cfg) : fn]);
  const tiposVehiculo = cfg.tiposVehiculo || TIPOS_VEHICULO;
  const [buscaAceite, setBuscaAceite] = useState("");

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-2">
        <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
          <Lock size={14} className="text-slate-400" /> Solo el administrador puede cambiar estos precios
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Utilidad (%) sobre el galón">
            <input className={inputCls} type="number" value={cfg.utilidad} onChange={(e) => setConfig({ ...cfg, utilidad: e.target.value })} />
          </Field>
          <Field label="Corte de litros">
            <input className={inputCls} type="number" step="0.5" value={cfg.corteLitros} onChange={(e) => setConfig({ ...cfg, corteLitros: e.target.value })} />
          </Field>
          <Field label="Recargo del sobrante (%)">
            <input className={inputCls} type="number" value={cfg.recargoExtra} onChange={(e) => setConfig({ ...cfg, recargoExtra: e.target.value })} />
          </Field>
        </div>
        <p className="text-[11px] text-slate-400">
          Ejemplo: galón de 165 + 10% = 181.5 → precio de venta 180 (siempre múltiplo de 10).
        </p>
        <p className="text-[11px] text-slate-400">
          El sobrante que no completa un galón se cobra por litro redondeado hacia arriba. Si el carro pasa de {cfg.corteLitros} L,
          ese litro lleva {cfg.recargoExtra}% extra. Ej: galón de 160 en 4 L, carro de 6.5 L → 160 + 3 L × 48 = S/304.
        </p>
      </Card>

      <Card className="p-4 space-y-2">
        <h2 className="font-semibold text-slate-800 text-sm">Servicios y sobreprecios por tipo de vehículo</h2>
        <EditorPlanes planes={cfg.planes} tiposVehiculo={tiposVehiculo} setConfig={setConfig} />
      </Card>

      <Card className="p-4 space-y-2">
        <h2 className="font-semibold text-slate-800 text-sm">Listado de precio de aceite variable</h2>
        <p className="text-xs text-slate-400">
          El precio de venta se calcula solo: costo + utilidad, redondeado a múltiplo de 10.
        </p>
        <input className={inputCls} value={buscaAceite} onChange={(e) => setBuscaAceite(e.target.value)} placeholder="Buscar aceite (ej: castrol, 10w40)..." />
        <EditarListaAceites aceites={cfg.aceites} utilidad={cfg.utilidad} setConfig={setConfig} buscar={buscaAceite} />
      </Card>

      <Card className="p-4 space-y-2">
        <h2 className="font-semibold text-slate-800 text-sm">Aditivos y extras</h2>
        <EditarListaPrecios titulo="Extras" items={cfg.extras || []} campo="extras" config={cfg} setConfig={setConfig} />
      </Card>

      <Card className="p-4 space-y-2">
        <h2 className="font-semibold text-slate-800 text-sm">Catálogo de vehículos (litros)</h2>
        <p className="text-xs text-slate-400">Corrige los litros de un modelo o quita los que no uses.</p>
        <GestorVehiculos vehiculos={cfg.vehiculos} setConfig={setConfig} notify={notify} />
      </Card>
    </div>
  );
}

function EditorPlanes({ planes, tiposVehiculo, setConfig }) {
  const updatePlan = (i, patch) =>
    setConfig((cfg) => ({ ...cfg, planes: cfg.planes.map((p, j) => (j === i ? { ...p, ...patch } : p)) }));
  const updateExtra = (i, tipoId, valor) =>
    setConfig((cfg) => ({
      ...cfg,
      planes: cfg.planes.map((p, j) => (j === i ? { ...p, extra: { ...p.extra, [tipoId]: valor } } : p)),
    }));
  const updateOpcion = (i, opId, nombre) =>
    setConfig((cfg) => ({
      ...cfg,
      planes: cfg.planes.map((p, j) => (j === i ? { ...p, opciones: (p.opciones || []).map((o) => (o.id === opId ? { ...o, nombre } : o)) } : p)),
    }));
  const agregarOpcion = (i) =>
    setConfig((cfg) => ({
      ...cfg,
      planes: cfg.planes.map((p, j) =>
        j === i ? { ...p, opciones: [...(p.opciones || []), { id: uid(), nombre: "" }] } : p
      ),
    }));
  const quitarOpcion = (i, opId) =>
    setConfig((cfg) => ({
      ...cfg,
      planes: cfg.planes.map((p, j) =>
        j === i ? { ...p, opciones: (p.opciones || []).filter((o) => o.id !== opId) } : p
      ),
    }));

  return (
    <div className="space-y-2">
      {planes.map((p, i) => (
        <div key={p.id} className="rounded-lg border border-slate-200 p-2 space-y-2">
          <input className={inputCls} value={p.nombre} onChange={(e) => updatePlan(i, { nombre: e.target.value })} placeholder="Nombre del servicio" />
          <div className="grid grid-cols-2 gap-1.5">
            {tiposVehiculo.map((t) => (
              <label key={t.id} className="text-[11px] text-slate-500">
                {t.nombre} (S/)
                <input
                  className={inputCls}
                  type="number"
                  value={p.extra?.[t.id] ?? ""}
                  placeholder="Sin precio"
                  onChange={(e) => updateExtra(i, t.id, e.target.value)}
                />
              </label>
            ))}
          </div>
          <textarea
            className={`${inputCls} h-20`}
            value={p.incluye || ""}
            onChange={(e) => updatePlan(i, { incluye: e.target.value })}
            placeholder="Qué incluye este servicio"
          />
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-600">Opciones: el cliente elige una (vacío = sin opciones)</p>
            {(p.opciones || []).map((o) => (
              <div key={o.id} className="flex gap-1.5 items-center">
                <input className={inputCls} value={o.nombre} onChange={(e) => updateOpcion(i, o.id, e.target.value)} placeholder="Ej: Lavado básico" />
                <button onClick={() => quitarOpcion(i, o.id)} className="text-slate-300 hover:text-rose-500 shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button onClick={() => agregarOpcion(i)} className="text-xs text-teal-700 font-medium flex items-center gap-1">
              <Plus size={13} /> Agregar opción
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CatalogoVehiculos({ vehiculos, form, setForm, esAdmin, irAPrecios }) {
  const [q, setQ] = useState("");
  const resultados = useMemo(() => {
    const t = norm(q.trim());
    if (!t) return [];
    return (vehiculos || [])
      .filter((v) => norm(`${v.marca} ${v.modelo} ${v.anio}`).includes(t))
      .slice(0, 8);
  }, [q, vehiculos]);

  const usar = (v) => {
    setForm((f) => ({
      ...f,
      marca: v.marca,
      modelo: v.modelo,
      anio: v.anio,
      tipoVeh: v.tipo,
      litros: String(v.litros ?? ""),
    }));
    setQ("");
  };

  return (
    <div className="rounded-lg border border-teal-200 bg-teal-50 p-2 space-y-2">
      <p className="text-xs font-semibold text-teal-900">Buscar vehículo (te llena los solos)</p>
      <input className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej: hilux, corolla, yaris..." />
      {resultados.length > 0 && (
        <div className="space-y-1">
          {resultados.map((v) => (
            <button
              key={v.id}
              onClick={() => usar(v)}
              className="w-full text-left rounded-lg bg-white border border-teal-200 px-2 py-1.5 text-xs text-slate-700 flex items-center justify-between gap-2"
            >
              <span className="truncate">
                {v.marca} {v.modelo} {v.anio}
              </span>
              <span className="shrink-0 font-semibold text-teal-700">{v.litros} L</span>
            </button>
          ))}
        </div>
      )}
      <p className="text-[11px] text-teal-800/70">
        ¿Falta tu vehículo? {esAdmin ? (
          <button onClick={irAPrecios} className="font-semibold underline">
            Agrégalo en la pestaña Precios
          </button>
        ) : (
          "Pídele al administrador que lo agregue en la pestaña Precios."
        )}
      </p>
      {(vehiculos || []).length > 0 && (
        <details className="text-[11px] text-slate-500">
          <summary className="cursor-pointer">Ver la lista ({vehiculos.length} vehículos)</summary>
          <ul className="mt-1 space-y-1 max-h-40 overflow-y-auto">
            {(vehiculos || []).map((v) => (
              <li key={v.id} className="flex items-center gap-1.5">
                <span className="truncate flex-1">
                  {v.marca} {v.modelo} {v.anio} · {v.litros} L
                </span>
                <button onClick={() => usar(v)} className="text-teal-700 font-medium">
                  usar
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function Cotizaciones({ clientes, cotizaciones, setCotizaciones, configCotList, esAdmin, irAPrecios, notify }) {
  const cfg = configCotCompleta((configCotList && configCotList[0]) || CONFIG_COT_DEFAULT);
  const tiposVehiculo = cfg.tiposVehiculo || TIPOS_VEHICULO;

  const formInicial = {
    clienteId: "",
    nombre: "",
    telefono: "",
    placa: "",
    marca: "",
    modelo: "",
    anio: "",
    tipoVeh: "auto",
    litros: "",
    planId: "basico",
    opcionPlan: "",
    aceiteId: "",
    extrasIds: [],
    descuento: "",
    modoEnvase: cfg.modoEnvase || "completo",
  };
  const [form, setForm] = useState(formInicial);

  const elegirCliente = (id) => {
    const c = clientes.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      clienteId: id,
      nombre: c ? c.nombre : f.nombre,
      telefono: c ? c.telefono || "" : f.telefono,
      placa: c ? c.placa || "" : f.placa,
      marca: c ? c.vehiculo || "" : f.marca,
    }));
  };

  const toggleId = (campo, id) =>
    setForm((f) => ({
      ...f,
      [campo]: f[campo].includes(id) ? f[campo].filter((x) => x !== id) : [...f[campo], id],
    }));

  const precioLitro = (a) => precioVentaEnvase(a?.costo, cfg.utilidad) / Number(a?.capacidad || 1);
  const ventaEnvase = (a) => precioVentaEnvase(a?.costo, cfg.utilidad);
  const plan = cfg.planes.find((p) => p.id === form.planId);
  const opciones = plan?.opciones || [];
  const opcionElegida = opciones.find((o) => o.id === form.opcionPlan) || opciones[0] || null;
  const aceite = cfg.aceites.find((a) => a.id === form.aceiteId);
  const extrasSel = (cfg.extras || []).filter((x) => form.extrasIds.includes(x.id));
  const litros = Number(form.litros || 0);
  const capacidad = Number(aceite?.capacidad || 0);
  const calculo = calculoAceite(aceite, litros, cfg);
  const galones = calculo.galones;
  const sobra = calculo.sobrante;
  const totalAceite = calculo.total;
  const sobreprecio = Number(plan?.extra?.[form.tipoVeh] || 0);
  const faltaPrecio = !!plan && sobreprecio <= 0;
  const extrasTotal = extrasSel.reduce((s, x) => s + Number(x.precio || 0), 0);
  const subtotal = totalAceite + sobreprecio + extrasTotal;
  const descuento = Math.min(Number(form.descuento || 0), subtotal);
  const total = subtotal - descuento;
  const listo = !!plan && !!aceite && litros > 0 && capacidad > 0 && !faltaPrecio;
  const sinOpcion = opciones.length > 0 && !opcionElegida;

  // El mensaje al cliente lista todo lo que incluye el servicio y el aceite
  // elegidos, pero sin precios sueltos: solo el total al final.
  const mensaje = (nombre) => {
    const tipoNombre = tiposVehiculo.find((t) => t.id === form.tipoVeh)?.nombre || "";
    const vehTxt = [form.marca, form.modelo, form.anio].filter(Boolean).join(" ");
    const incluye = String(plan?.incluye || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const aceiteLinea = !aceite
      ? ""
      : `Aceite ${aceite.nombre} (${galones} galón${galones === 1 ? "" : "es"} de ${capacidad} L${
          sobra > 0 ? ` + ${sobra} L` : ""
        })`;
    return [
      "*Cotización - MaxWash D'Durand*",
      "",
      `Cliente: ${nombre || "cliente"}`,
      [[vehTxt && `Vehículo: ${vehTxt}`], [tipoNombre && `(${tipoNombre})`], [form.placa && `Placa: ${form.placa}`]]
        .filter(Boolean)
        .join(" "),
      "",
      `*${plan?.nombre || "Servicio"}*`,
      ...incluye.map((x) => `• ${x}`),
      ...(opcionElegida ? [`• ${opcionElegida.nombre}`] : []),
      aceiteLinea && `• ${aceiteLinea}`,
      ...extrasSel.map((x) => `• ${x.nombre}`),
      "",
      `*TOTAL: ${soles(total)}*`,
      "",
      "¿Confirmas este servicio? Te esperamos en MaxWash D'Durand.",
    ]
      .filter((l) => l !== "")
      .join("\n");
  };

  const guardar = async (abrirWhatsApp) => {
    if (!plan) return notify("Elige el tipo de servicio");
    if (!aceite) return notify("Elige el aceite");
    if (!litros) return notify("Escribe o busca los litros del vehículo");
    if (!capacidad) return notify("Este aceite no tiene capacidad definida. El administrador debe corregirlo en la pestaña Precios.");
    if (faltaPrecio) return notify(`Falta el sobreprecio de ${tiposVehiculo.find((t) => t.id === form.tipoVeh)?.nombre}. Pídele al administrador que lo ponga en la pestaña Precios.`);
    if (sinOpcion) return notify("Elige una de las opciones del servicio");
    const nombre = form.nombre.trim();
    const wa = telParaWhatsApp(form.telefono);
    const texto = mensaje(nombre);
    if (abrirWhatsApp && wa) {
      window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
    }
    await setCotizaciones([
      {
        id: uid(),
        fecha: new Date().toISOString(),
        clienteId: form.clienteId || null,
        nombre: nombre || "Cliente sin nombre",
        telefono: form.telefono,
        placa: form.placa,
        vehiculo: [form.marca, form.modelo, form.anio].filter(Boolean).join(" "),
        tipoVeh: form.tipoVeh,
        litros,
        plan: plan.nombre,
        opcion: opcionElegida ? opcionElegida.nombre : "",
        aceite: aceite.nombre,
        precioLitro: calculo.precioLitro,
        galones,
        litrosExtra: sobra,
        sobreprecio,
        extras: extrasSel.map((x) => ({ nombre: x.nombre, precio: Number(x.precio || 0) })),
        descuento,
        total,
        mensaje: texto,
        enviada: !!(abrirWhatsApp && wa),
      },
      ...(cotizaciones || []),
    ]);
    setForm({ ...formInicial });
    notify(abrirWhatsApp ? (wa ? "Cotización enviada y guardada" : "Guardada (el cliente no tiene teléfono)") : "Cotización guardada");
  };

  const reenviar = (q) => {
    const wa = telParaWhatsApp(q.telefono);
    if (!wa) return notify("Esta cotización no tiene teléfono");
    window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(q.mensaje || ""), "_blank", "noopener");
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <Tag size={14} className="text-slate-400" /> Precios en uso
            </h2>
            <p className="text-xs text-slate-500">
              Utilidad {cfg.utilidad}% · {cfg.planes.length} servicios · {cfg.aceites.length} aceites
            </p>
          </div>
          {esAdmin && (
            <button onClick={irAPrecios} className="shrink-0 text-xs text-teal-700 font-medium flex items-center gap-1">
              <Settings size={13} /> Editar precios
            </button>
          )}
        </div>
        {!esAdmin && (
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Lock size={12} /> Solo el administrador puede modificar los precios.
          </p>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="font-semibold text-slate-800 text-sm">Nueva cotización</h2>

        {clientes.length > 0 && (
          <Field label="Buscar cliente registrado">
            <select className={inputCls} value={form.clienteId} onChange={(e) => elegirCliente(e.target.value)}>
              <option value="">— Cliente nuevo (escribir a mano) —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                  {c.telefono ? ` · ${c.telefono}` : ""}
                </option>
              ))}
            </select>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Field label="Nombre">
            <input className={inputCls} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </Field>
          <Field label="Teléfono (WhatsApp)">
            <input className={inputCls} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="9 dígitos" />
          </Field>
        </div>

        <CatalogoVehiculos vehiculos={cfg.vehiculos} form={form} setForm={setForm} esAdmin={esAdmin} irAPrecios={irAPrecios} />

        <div className="grid grid-cols-2 gap-2">
          <Field label="Marca">
            <input className={inputCls} value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} placeholder="Toyota" />
          </Field>
          <Field label="Modelo">
            <input className={inputCls} value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} placeholder="Hilux 2.8" />
          </Field>
          <Field label="Año">
            <input className={inputCls} value={form.anio} onChange={(e) => setForm({ ...form, anio: e.target.value })} placeholder="2019" />
          </Field>
          <Field label="Placa">
            <input className={inputCls} value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })} placeholder="ABC-123" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Tipo de vehículo">
            <select className={inputCls} value={form.tipoVeh} onChange={(e) => setForm({ ...form, tipoVeh: e.target.value })}>
              {tiposVehiculo.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Litros de aceite">
            <input className={inputCls} type="number" step="0.1" value={form.litros} onChange={(e) => setForm({ ...form, litros: e.target.value })} placeholder="8" />
          </Field>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-600 mb-1">Servicio</p>
          <div className="space-y-1.5">
            {cfg.planes.map((p) => (
              <button
                key={p.id}
                onClick={() => setForm({ ...form, planId: p.id })}
                className={`w-full text-left rounded-lg border px-2.5 py-2 ${
                  form.planId === p.id ? "border-teal-600 bg-teal-50" : "border-slate-200"
                }`}
              >
                <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  {form.planId === p.id && <Check size={13} className="text-teal-700" />}
                  {p.nombre}
                  <span className="font-normal text-slate-500">
                    (aceite + {soles(Number(p.extra?.[form.tipoVeh] || 0))})
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{p.incluye}</p>
              </button>
            ))}
          </div>
          {faltaPrecio && (
            <p className="text-[11px] text-rose-600 mt-1">
              No hay sobreprecio para {tiposVehiculo.find((t) => t.id === form.tipoVeh)?.nombre}. Solo el administrador lo configura en la pestaña Precios.
            </p>
          )}
          {opciones.length > 0 && (
            <div className="mt-2 rounded-lg border border-slate-200 p-2 space-y-1">
              <p className="text-xs font-medium text-slate-600">El cliente elige una:</p>
              {opciones.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setForm({ ...form, opcionPlan: o.id })}
                  className={`w-full text-left rounded-lg border px-2 py-1.5 text-xs flex items-center gap-1.5 ${
                    opcionElegida?.id === o.id ? "border-teal-600 bg-teal-50 text-teal-900" : "border-slate-200 text-slate-600"
                  }`}
                >
                  {opcionElegida?.id === o.id && <Check size={13} className="text-teal-700 shrink-0" />}
                  {o.nombre}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Aceite (galón)">
            <select className={inputCls} value={form.aceiteId} onChange={(e) => setForm({ ...form, aceiteId: e.target.value })}>
              <option value="">— Elegir —</option>
              {gruposAceites(cfg.aceites).map((g) => (
                <optgroup key={g.grupo} label={g.grupo}>
                  {g.aceites.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} · {soles(ventaEnvase(a))}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
          <Field label="Descuento (S/)">
            <input className={inputCls} type="number" value={form.descuento} onChange={(e) => setForm({ ...form, descuento: e.target.value })} placeholder="0" />
          </Field>
        </div>

        {aceite && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 space-y-0.5">
            <p className="text-[11px] font-semibold text-slate-600">Cómo se cobra el aceite</p>
            <p className="text-[11px] text-slate-500">
              {galones} galón{galones === 1 ? "" : "es"} de {capacidad} L × {soles(calculo.ventaGalon)}
              {sobra > 0 ? ` · ${sobra} L sobrante × ${soles(calculo.precioSobrante)}` : ""}
            </p>
            <p className="text-[10px] text-slate-400">
              Litro normal {soles(calculo.precioLitro)}
              {litros > Number(cfg.corteLitros || 0)
                ? ` · sobrante con +${cfg.recargoExtra}% porque el carro pasa de ${cfg.corteLitros} L`
                : ` · sin recargo (el carro no pasa de ${cfg.corteLitros} L)`}
            </p>
          </div>
        )}

        {(cfg.extras || []).length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">Aditivos y extras (opcional)</p>
            <div className="flex flex-wrap gap-1.5">
              {cfg.extras.map((x) => (
                <button
                  key={x.id}
                  onClick={() => toggleId("extrasIds", x.id)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                    form.extrasIds.includes(x.id) ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-500"
                  }`}
                >
                  {x.nombre} · {soles(x.precio)}
                </button>
              ))}
            </div>
          </div>
        )}

        {listo && (
          <div className="rounded-lg p-3 bg-slate-50 border border-slate-200 space-y-1">
            {aceite && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>
                  Aceite {aceite.nombre} · {galones} galón{galones === 1 ? "" : "es"} de {capacidad} L
                  {sobra > 0 ? ` + ${sobra} L extra` : ""}
                </span>
                <span>{soles(totalAceite)}</span>
              </div>
            )}
            {plan && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>{plan.nombre}</span>
                <span>{soles(sobreprecio)}</span>
              </div>
            )}
            {extrasSel.map((x) => (
              <div key={x.id} className="flex justify-between text-xs text-slate-500">
                <span>{x.nombre}</span>
                <span>{soles(x.precio)}</span>
              </div>
            ))}
            {descuento > 0 && (
              <div className="flex justify-between text-xs text-rose-600">
                <span>Descuento</span>
                <span>-{soles(descuento)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1 mt-1 border-t border-slate-200 text-teal-700">
              <span>Total</span>
              <span>{soles(total)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => guardar(true)}
            className="flex-1 bg-teal-600 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5"
          >
            <MessageCircle size={16} /> Enviar por WhatsApp
          </button>
          <button onClick={() => guardar(false)} className="shrink-0 px-3 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600">
            Solo guardar
          </button>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold text-slate-800 mb-2 text-sm">Cotizaciones guardadas ({(cotizaciones || []).length})</h2>
        {(cotizaciones || []).length === 0 ? (
          <EmptyState text="Todavía no hay cotizaciones." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {cotizaciones.slice(0, 25).map((q) => (
              <li key={q.id} className="py-3 flex items-center gap-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800 truncate">
                    {q.nombre} {q.enviada ? "" : "(sin enviar)"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {fechaLocal(q.fecha)} {fmtHora(q.fecha)} · {[q.plan, q.opcion, q.vehiculo].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <span className="font-semibold text-teal-700 text-sm shrink-0">{soles(q.total)}</span>
                <button onClick={() => reenviar(q)} className="text-[#25D366] hover:text-[#1da851] shrink-0" title="Reenviar por WhatsApp">
                  <MessageCircle size={17} />
                </button>
                <button onClick={() => setCotizaciones(cotizaciones.filter((x) => x.id !== q.id))} className="text-slate-300 hover:text-rose-500 shrink-0">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Gastos({ gastos, setGastos, notify }) {
  const [form, setForm] = useState({ concepto: "", monto: "", categoria: "Insumos" });
  const categorias = ["Insumos", "Compras", "Servicios", "Personal", "Otros"];

  const add = async () => {
    if (!form.concepto.trim() || !form.monto) return notify("Completa concepto y monto");
    await setGastos([...gastos, { id: uid(), concepto: form.concepto.trim(), monto: Number(form.monto), categoria: form.categoria, fecha: new Date().toISOString() }]);
    setForm({ concepto: "", monto: "", categoria: form.categoria });
    notify("Gasto registrado");
  };

  const remove = async (id) => setGastos(gastos.filter((g) => g.id !== id));
  const totalMes = gastos.filter((g) => fechaLocal(g.fecha).slice(0, 7) === hoy().slice(0, 7)).reduce((s, g) => s + g.monto, 0);

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold text-slate-800 text-sm">Registrar compra / gasto</h2>
        <Field label="Concepto">
          <input className={inputCls} value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} placeholder="Ej. Shampoo para autos" />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Monto (S/)">
            <input type="number" min="0" step="0.1" className={inputCls} value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} />
          </Field>
          <Field label="Categoría">
            <select className={inputCls} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              {categorias.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <button onClick={add} className="w-full bg-rose-600 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5">
          <Plus size={16} /> Guardar gasto
        </button>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-slate-800 text-sm">Gastos ({gastos.length})</h2>
          <span className="text-xs text-slate-500">Este mes: <strong className="text-rose-600">{soles(totalMes)}</strong></span>
        </div>
        {gastos.length === 0 ? (
          <EmptyState text="Sin gastos registrados." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {[...gastos].reverse().map((g) => (
              <li key={g.id} className="py-2.5 flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 truncate">{g.concepto}</p>
                  <p className="text-xs text-slate-400">{g.categoria} · {fmtFecha(g.fecha)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="font-semibold text-rose-600">{soles(g.monto)}</span>
                  <button onClick={() => remove(g.id)} className="text-slate-300 hover:text-rose-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Tienda({ productos, setProductos, ventas, setVentas, notify, isAdmin = true }) {
  const [form, setForm] = useState({ nombre: "", costo: "", precio: "", stock: "", stockMinimo: "3" });
  const [venta, setVenta] = useState({ productoId: "", cantidad: "1", formaPago: "efectivo" });
  const [reponer, setReponer] = useState({});
  const [dividido, setDividido] = useState(false);
  const [montos, setMontos] = useState({ efectivo: "", yape: "", tarjeta: "" });
  const valorInventario = productos.reduce((s, p) => s + Number(p.costo || 0) * Number(p.stock || 0), 0);

  const addProducto = async () => {
    if (!form.nombre.trim() || !form.precio || form.stock === "") return notify("Completa nombre, precio y stock inicial");
    await setProductos([
      ...productos,
      { id: uid(), nombre: form.nombre.trim(), costo: Number(form.costo || 0), precio: Number(form.precio), stock: Number(form.stock), stockMinimo: Number(form.stockMinimo || 0) },
    ]);
    setForm({ nombre: "", costo: "", precio: "", stock: "", stockMinimo: "3" });
    notify("Producto agregado al stock");
  };

  const removeProducto = async (id) => setProductos(productos.filter((p) => p.id !== id));

  const aplicarReponer = async (id) => {
    const cant = Number(reponer[id]?.cantidad || 0);
    if (!cant) return;
    const nuevoCosto = reponer[id]?.costo;
    await setProductos(
      productos.map((p) => (p.id === id ? { ...p, stock: p.stock + cant, costo: nuevoCosto ? Number(nuevoCosto) : p.costo } : p))
    );
    setReponer((r) => ({ ...r, [id]: { cantidad: "", costo: "" } }));
    notify("Stock actualizado");
  };

  const productoSel = productos.find((p) => p.id === venta.productoId);
  const precioUnit = venta.precioUnit !== "" && venta.precioUnit !== undefined ? Number(venta.precioUnit) : (productoSel?.precio || 0);
  const totalVenta = productoSel ? precioUnit * Number(venta.cantidad || 0) : 0;
  const sumaDividido = Number(montos.efectivo || 0) + Number(montos.yape || 0) + Number(montos.tarjeta || 0);
  const diferenciaDividido = Math.round((totalVenta - sumaDividido) * 100) / 100;

  const registrarVenta = async () => {
    if (!productoSel) return notify("Elige un producto");
    const cant = Number(venta.cantidad || 0);
    if (cant <= 0) return notify("Cantidad inválida");
    if (cant > productoSel.stock) return notify(`Solo quedan ${productoSel.stock} unidades`);
    if (dividido && Math.abs(diferenciaDividido) > 0.01) return notify(`Los montos no cuadran: falta ${soles(diferenciaDividido)}`);

    const pagos = dividido
      ? PAGOS.map((p) => ({ metodo: p.id, monto: Number(montos[p.id] || 0) })).filter((p) => p.monto > 0)
      : undefined;

    await setProductos(productos.map((p) => (p.id === productoSel.id ? { ...p, stock: p.stock - cant } : p)));
    await setVentas([
      ...ventas,
      { id: uid(), productoId: productoSel.id, nombreProducto: productoSel.nombre, cantidad: cant, precioUnitario: precioUnit, total: totalVenta, formaPago: venta.formaPago, fecha: new Date().toISOString(), ...(pagos ? { pagos } : {}) },
    ]);
    setVenta({ productoId: "", cantidad: "1", formaPago: "efectivo", precioUnit: "" });
    setDividido(false);
    setMontos({ efectivo: "", yape: "", tarjeta: "" });
    notify("Venta registrada");
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-1 bg-slate-50">
        <p className="text-xs text-slate-500">
          Usa esto para ventas de mostrador (el cliente solo compra algo, sin lavado). Si el producto es para una cuenta abierta de un lavado, agrégalo desde la pestaña "Cuentas".
        </p>
      </Card>
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-slate-800">
          <Store size={17} />
          <h2 className="font-semibold text-sm">Registrar venta de mostrador</h2>
        </div>
        {productos.length === 0 ? (
          <EmptyState text="Agrega productos al stock para poder vender." />
        ) : (
          <>
            <Field label="Producto">
              <select className={inputCls} value={venta.productoId} onChange={(e) => setVenta({ ...venta, productoId: e.target.value, precioUnit: "" })}>
                <option value="">Selecciona un producto</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} · {soles(p.precio)} · quedan {p.stock}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Cantidad">
                <input type="number" min="1" className={inputCls} value={venta.cantidad} onChange={(e) => setVenta({ ...venta, cantidad: e.target.value })} />
              </Field>
              {!dividido && (
                <Field label="Forma de pago">
                  <select className={inputCls} value={venta.formaPago} onChange={(e) => setVenta({ ...venta, formaPago: e.target.value })}>
                    {PAGOS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </Field>
              )}
            </div>
            <button type="button" onClick={() => setDividido((d) => !d)} className="text-xs font-medium text-teal-700 underline">
              {dividido ? "Usar un solo método de pago" : "¿Pagó con 2 métodos distintos? Dividir el pago"}
            </button>
            {dividido && (
              <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-3 space-y-2">
                <p className="text-xs text-teal-800">Ingresa cuánto pagó con cada método (deben sumar el total):</p>
                <div className="grid grid-cols-3 gap-2">
                  {PAGOS.map((p) => (
                    <Field key={p.id} label={p.label}>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className={inputCls}
                        value={montos[p.id]}
                        onChange={(e) => setMontos((m) => ({ ...m, [p.id]: e.target.value }))}
                      />
                    </Field>
                  ))}
                </div>
                <p className={`text-xs font-medium ${Math.abs(diferenciaDividido) > 0.01 ? "text-rose-600" : "text-teal-700"}`}>
                  {Math.abs(diferenciaDividido) > 0.01
                    ? diferenciaDividido > 0
                      ? `Falta ${soles(diferenciaDividido)} para completar el total`
                      : `Te pasaste por ${soles(Math.abs(diferenciaDividido))}`
                    : "✓ Los montos cuadran con el total"}
                </p>
              </div>
            )}
            {productoSel && (
              <Field label="Precio final por unidad (S/) — puedes ajustarlo solo para esta venta">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputCls}
                  value={venta.precioUnit !== "" && venta.precioUnit !== undefined ? venta.precioUnit : productoSel.precio}
                  onChange={(e) => setVenta({ ...venta, precioUnit: e.target.value })}
                />
              </Field>
            )}
            {productoSel && <p className="text-sm font-semibold text-teal-700">Total: {soles(totalVenta)}</p>}
            <button
              onClick={registrarVenta}
              disabled={dividido && Math.abs(diferenciaDividido) > 0.01}
              className="w-full bg-teal-600 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              Registrar venta
            </button>
          </>
        )}
      </Card>

      {isAdmin && (
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold text-slate-800 text-sm">Agregar producto al stock</h2>
          <Field label="Nombre del producto">
            <input className={inputCls} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Ambientador aroma vainilla" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Costo — lo que te costó (S/)">
              <input type="number" min="0" step="0.1" className={inputCls} value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} />
            </Field>
            <Field label="Precio de venta (S/)">
              <input type="number" min="0" step="0.1" className={inputCls} value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Stock inicial">
              <input type="number" min="0" className={inputCls} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </Field>
            <Field label="Stock mínimo">
              <input type="number" min="0" className={inputCls} value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })} />
            </Field>
          </div>
          <button onClick={addProducto} className="w-full bg-slate-800 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5">
            <Plus size={16} /> Agregar producto
          </button>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-slate-800 text-sm">Stock actual ({productos.length})</h2>
          <span className="text-xs text-slate-500">Invertido: <strong className="text-teal-700">{soles(valorInventario)}</strong></span>
        </div>
        {productos.length === 0 ? (
          <EmptyState text="Aún no tienes productos en la tienda." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {productos.map((p) => {
              const bajo = p.stock <= p.stockMinimo;
              return (
                <li key={p.id} className="py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate flex items-center gap-1.5">
                        {p.nombre}
                        {bajo && <AlertTriangle size={13} className="text-amber-600" />}
                      </p>
                      <p className={`text-xs ${bajo ? "text-amber-600 font-medium" : "text-slate-400"}`}>
                        Quedan {p.stock} · mínimo {p.stockMinimo} · venta {soles(p.precio)} · costo {soles(p.costo)} c/u
                      </p>
                      <p className="text-xs text-teal-700 font-medium">Valor en stock: {soles(Number(p.costo || 0) * p.stock)}</p>
                    </div>
                    {isAdmin && (
                      <button onClick={() => removeProducto(p.id)} className="text-slate-300 hover:text-rose-500 shrink-0 ml-2">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Cant. a reponer"
                        className={`${inputCls} py-1.5`}
                        value={reponer[p.id]?.cantidad || ""}
                        onChange={(e) => setReponer((r) => ({ ...r, [p.id]: { ...r[p.id], cantidad: e.target.value } }))}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Nuevo costo (opc.)"
                        className={`${inputCls} py-1.5`}
                        value={reponer[p.id]?.costo || ""}
                        onChange={(e) => setReponer((r) => ({ ...r, [p.id]: { ...r[p.id], costo: e.target.value } }))}
                      />
                      <button onClick={() => aplicarReponer(p.id)} className="shrink-0 rounded-lg bg-teal-600 text-white px-3 text-xs font-medium">
                        Reponer
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function CambioAceite({ repuestos, setRepuestos, notify, isAdmin = true }) {
  const [form, setForm] = useState({ categoria: CATEGORIAS_ACEITE[0], nombre: "", codigo: "", costo: "", precio: "", stock: "", stockMinimo: "3" });
  const [reponer, setReponer] = useState({});
  const valorInventario = repuestos.reduce((s, r) => s + Number(r.costo || 0) * Number(r.stock || 0), 0);

  const add = async () => {
    if (!form.nombre.trim()) return notify("Escribe el nombre");
    if (!form.codigo.trim()) return notify("Escribe el código del producto");
    if (!form.precio || form.stock === "") return notify("Completa precio y stock inicial");
    await setRepuestos([
      ...repuestos,
      {
        id: uid(),
        categoria: form.categoria,
        nombre: form.nombre.trim(),
        codigo: form.codigo.trim().toUpperCase(),
        costo: Number(form.costo || 0),
        precio: Number(form.precio),
        stock: Number(form.stock),
        stockMinimo: Number(form.stockMinimo || 0),
      },
    ]);
    setForm({ ...form, nombre: "", codigo: "", costo: "", precio: "", stock: "" });
    notify("Registrado en el inventario de cambio de aceite");
  };

  const remove = async (id) => setRepuestos(repuestos.filter((r) => r.id !== id));

  const aplicarReponer = async (id) => {
    const cant = Number(reponer[id]?.cantidad || 0);
    if (!cant) return;
    const nuevoCosto = reponer[id]?.costo;
    await setRepuestos(
      repuestos.map((r) => (r.id === id ? { ...r, stock: r.stock + cant, costo: nuevoCosto ? Number(nuevoCosto) : r.costo } : r))
    );
    setReponer((rr) => ({ ...rr, [id]: { cantidad: "", costo: "" } }));
    notify("Stock actualizado");
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-1 bg-amber-50 border-amber-200">
        <p className="text-xs text-amber-800">
          Registra aquí tu inventario de aceites y filtros con su código, para poder elegirlos al agregar un "Cambio de aceite" dentro de una cuenta abierta.
        </p>
      </Card>

      {isAdmin && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-slate-800">
            <Wrench size={17} />
            <h2 className="font-semibold text-sm">Agregar aceite o filtro</h2>
          </div>
          <Field label="Sub categoría">
            <select className={inputCls} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              {CATEGORIAS_ACEITE.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Nombre">
              <input className={inputCls} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Aceite 20W-50 sintético" />
            </Field>
            <Field label="Código">
              <input className={inputCls} value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="Ej. AC-2050" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Costo — lo que te costó (S/)">
              <input type="number" min="0" step="0.1" className={inputCls} value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} />
            </Field>
            <Field label="Precio de venta (S/)">
              <input type="number" min="0" step="0.1" className={inputCls} value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Stock inicial">
              <input type="number" min="0" className={inputCls} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </Field>
            <Field label="Stock mínimo">
              <input type="number" min="0" className={inputCls} value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })} />
            </Field>
          </div>
          <button onClick={add} className="w-full bg-amber-500 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5">
            <Plus size={16} /> Agregar al inventario
          </button>
        </Card>
      )}

      <Card className="p-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">Valor total invertido en aceite y filtros</span>
        <span className="text-lg font-bold text-teal-700">{soles(valorInventario)}</span>
      </Card>

      {CATEGORIAS_ACEITE.map((cat) => {
        const items = repuestos.filter((r) => r.categoria === cat);
        return (
          <Card key={cat} className="p-4">
            <h2 className="font-semibold text-slate-800 mb-2 text-sm">{cat} ({items.length})</h2>
            {items.length === 0 ? (
              <EmptyState text="Nada registrado en esta sub categoría." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((r) => {
                  const bajo = r.stock <= r.stockMinimo;
                  return (
                    <li key={r.id} className="py-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate flex items-center gap-1.5">
                            {r.nombre}
                            {bajo && <AlertTriangle size={13} className="text-amber-600" />}
                          </p>
                          <p className={`text-xs flex items-center gap-1 ${bajo ? "text-amber-600 font-medium" : "text-slate-400"}`}>
                            <Barcode size={11} /> {r.codigo} · quedan {r.stock} · mínimo {r.stockMinimo} · venta {soles(r.precio)} · costo {soles(r.costo)} c/u
                          </p>
                          <p className="text-xs text-teal-700 font-medium">Valor en stock: {soles(Number(r.costo || 0) * r.stock)}</p>
                        </div>
                        {isAdmin && (
                          <button onClick={() => remove(r.id)} className="text-slate-300 hover:text-rose-500 shrink-0 ml-2">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2 mt-2">
                          <input
                            type="number"
                            min="1"
                            placeholder="Cant. a reponer"
                            className={`${inputCls} py-1.5`}
                            value={reponer[r.id]?.cantidad || ""}
                            onChange={(e) => setReponer((rr) => ({ ...rr, [r.id]: { ...rr[r.id], cantidad: e.target.value } }))}
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="Nuevo costo (opc.)"
                            className={`${inputCls} py-1.5`}
                            value={reponer[r.id]?.costo || ""}
                            onChange={(e) => setReponer((rr) => ({ ...rr, [r.id]: { ...rr[r.id], costo: e.target.value } }))}
                          />
                          <button onClick={() => aplicarReponer(r.id)} className="shrink-0 rounded-lg bg-amber-500 text-white px-3 text-xs font-medium">
                            Reponer
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function CatalogoSection({ title, items, setItems, withPrice, placeholder, notify, color, isAdmin = true }) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");

  const add = async () => {
    if (!nombre.trim()) return notify("Escribe un nombre");
    if (withPrice && !precio) return notify("Escribe un precio");
    await setItems([...items, { id: uid(), nombre: nombre.trim(), ...(withPrice ? { precio: Number(precio) } : {}) }]);
    setNombre("");
    setPrecio("");
  };
  const remove = async (id) => setItems(items.filter((i) => i.id !== id));

  return (
    <Card className="p-4 space-y-3">
      <h2 className="font-semibold text-slate-800 text-sm">{title}</h2>
      {isAdmin && (
        <div className="flex gap-2">
          <input className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={placeholder} />
          {withPrice && (
            <input type="number" min="0" step="0.1" className={`${inputCls} w-24`} value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="S/" />
          )}
          <button onClick={add} className={`shrink-0 rounded-lg ${color} text-white px-3`}>
            <Plus size={18} />
          </button>
        </div>
      )}
      {items.length === 0 ? (
        <EmptyState text="Nada agregado todavía." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((i) => (
            <li key={i.id} className="py-2 flex items-center justify-between text-sm">
              <span className="text-slate-700">{i.nombre}{withPrice ? ` · ${soles(i.precio)}` : ""}</span>
              {isAdmin && (
                <button onClick={() => remove(i.id)} className="text-slate-300 hover:text-rose-500">
                  <X size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Catalogo({ tipos, setTipos, extras, setExtras, lavadores, setLavadores, notify, isAdmin = true }) {
  return (
    <div className="space-y-4">
      {!isAdmin && (
        <Card className="p-3 bg-slate-50">
          <p className="text-xs text-slate-500">Solo el administrador puede modificar el catálogo.</p>
        </Card>
      )}
      <CatalogoSection title="Tipos de lavado" items={tipos} setItems={setTipos} withPrice placeholder="Ej. Lavado exterior" notify={notify} color="bg-teal-600" isAdmin={isAdmin} />
      <CatalogoSection title="Extras" items={extras} setItems={setExtras} withPrice placeholder="Ej. Aromatizante" notify={notify} color="bg-amber-500" isAdmin={isAdmin} />
      <CatalogoSection title="Lavadores" items={lavadores} setItems={setLavadores} withPrice={false} placeholder="Nombre del lavador" notify={notify} color="bg-slate-700" isAdmin={isAdmin} />
    </div>
  );
}
