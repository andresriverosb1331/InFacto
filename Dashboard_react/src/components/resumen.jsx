import * as XLSX from "xlsx";

function agruparPorDiaYPedido(contenido) {
  // Filtra solo servilleteras
  const filas = contenido.filter(f => f.id_sevilletera);
  // Agrupa por fecha y pedido
  const resumen = {};
  filas.forEach(fila => {
    const fecha = fila.fecha?.slice(0, 10);
    const pedido = fila.id_pedido;
    const maquina = fila.id_sevilletera || ""; // <-- Corrección aquí
    if (!resumen[fecha]) resumen[fecha] = {};
    if (!resumen[fecha][pedido]) resumen[fecha][pedido] = { total: 0, restante: 0, maquinas: new Set() };
    resumen[fecha][pedido].total += Number(fila.unidades_producidas || 0);
    resumen[fecha][pedido].restante = Math.floor(fila.unidades_restantes || 0);
    if (maquina) resumen[fecha][pedido].maquinas.add(maquina);
  });
  return resumen;
}

export default function ResumenExcel({ contenido, className }) {
  const handleDescargar = () => {
    const resumen = agruparPorDiaYPedido(contenido);
    const rows = [["Fecha", "Pedido", "Total Producidas", "Restante", "Máquinas"]];
    // Ordenar fechas de menor a mayor
    const fechasOrdenadas = Object.keys(resumen).sort();
    fechasOrdenadas.forEach(fecha => {
      // Ordenar pedidos de menor a mayor
      const pedidosOrdenados = Object.keys(resumen[fecha]).sort();
      pedidosOrdenados.forEach(pedido => {
        const datos = resumen[fecha][pedido];
        const maquinas = Array.from(datos.maquinas).join(", ");
        rows.push([fecha, pedido, datos.total, datos.restante, maquinas]);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resumen");
    XLSX.writeFile(wb, "resumen_servilleteras.xlsx");
  };

  return (
    <button className={`btn ${className || ""}`} onClick={handleDescargar}>
      Descargar Resumen Excel
    </button>
  );
}