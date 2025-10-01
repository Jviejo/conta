import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const dbName = 'conta2025';

// Función para generar número aleatorio entre min y max
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db(dbName);

    // 1. LIMPIAR TODAS LAS COLECCIONES
    console.log('\n🗑️  Limpiando base de datos...');
    const collections = ['niveles', 'cuentas', 'subcontas', 'ejercicios', 'conceptos', 'asientos', 'apuntes', 'facturas', 'iva', 'saldos'];
    for (const col of collections) {
      await db.collection(col).deleteMany({});
      console.log(`   - ${col} limpiado`);
    }

    // 2. CREAR EJERCICIO 2025
    console.log('\n📅 Creando ejercicio...');
    await db.collection('ejercicios').insertOne({ year: 2025 });

    // 3. CREAR SUBCONTA
    console.log('\n🔢 Creando subconta...');
    await db.collection('subcontas').insertOne({ id: 1, nombre: 'Principal' });

    // 4. CREAR NIVELES (Plan General Contable hasta 4 dígitos)
    console.log('\n📋 Creando niveles (Plan General Contable)...');
    const niveles = [
      // Grupo 1: Financiación Básica
      { id: 1, nombre: 'FINANCIACIÓN BÁSICA' },
      { id: 10, nombre: 'Capital' },
      { id: 11, nombre: 'Reservas' },
      { id: 12, nombre: 'Resultados pendientes de aplicación' },
      { id: 17, nombre: 'Deudas a largo plazo' },

      // Grupo 2: Activo no corriente
      { id: 2, nombre: 'ACTIVO NO CORRIENTE' },
      { id: 20, nombre: 'Inmovilizaciones intangibles' },
      { id: 21, nombre: 'Inmovilizaciones materiales' },
      { id: 22, nombre: 'Inversiones inmobiliarias' },

      // Grupo 3: Existencias
      { id: 3, nombre: 'EXISTENCIAS' },
      { id: 30, nombre: 'Comerciales' },
      { id: 31, nombre: 'Materias primas' },

      // Grupo 4: Acreedores y deudores
      { id: 4, nombre: 'ACREEDORES Y DEUDORES' },
      { id: 40, nombre: 'Proveedores' },
      { id: 400, nombre: 'Proveedores' },
      { id: 410, nombre: 'Acreedores por prestación de servicios' },
      { id: 43, nombre: 'Clientes' },
      { id: 430, nombre: 'Clientes' },
      { id: 44, nombre: 'Deudores varios' },
      { id: 46, nombre: 'Personal' },
      { id: 47, nombre: 'Administraciones Públicas' },
      { id: 472, nombre: 'HP IVA soportado' },
      { id: 477, nombre: 'HP IVA repercutido' },
      { id: 475, nombre: 'HP acreedora por retenciones practicadas' },
      { id: 4750, nombre: 'HP acreedora por retenciones practicadas' },

      // Grupo 5: Cuentas financieras
      { id: 5, nombre: 'CUENTAS FINANCIERAS' },
      { id: 57, nombre: 'Tesorería' },
      { id: 570, nombre: 'Caja' },
      { id: 572, nombre: 'Bancos' },

      // Grupo 6: Compras y gastos
      { id: 6, nombre: 'COMPRAS Y GASTOS' },
      { id: 60, nombre: 'Compras' },
      { id: 600, nombre: 'Compras de mercaderías' },
      { id: 62, nombre: 'Servicios exteriores' },
      { id: 623, nombre: 'Servicios de profesionales independientes' },
      { id: 64, nombre: 'Gastos de personal' },

      // Grupo 7: Ventas e ingresos
      { id: 7, nombre: 'VENTAS E INGRESOS' },
      { id: 70, nombre: 'Ventas' },
      { id: 700, nombre: 'Ventas de mercaderías' },
      { id: 705, nombre: 'Prestaciones de servicios' },
    ];

    await db.collection('niveles').insertMany(niveles);
    console.log(`   ✓ ${niveles.length} niveles creados`);

    // 5. CREAR CUENTAS
    console.log('\n💼 Creando cuentas...');
    const cuentas: Array<{ id: number; nombre: string }> = [];

    // Cuentas básicas
    cuentas.push(
      { id: 1000000, nombre: 'Capital Social' },
      { id: 1290000, nombre: 'Resultado del ejercicio' },
      { id: 5700000, nombre: 'Caja, euros' },
      { id: 4720000, nombre: 'HP IVA soportado' },
      { id: 4770000, nombre: 'HP IVA repercutido' },
      { id: 4750000, nombre: 'HP acreedora por retenciones practicadas' },
      { id: 6000000, nombre: 'Compras de mercaderías' },
      { id: 6230000, nombre: 'Servicios de profesionales independientes' },
      { id: 7000000, nombre: 'Ventas de mercaderías' },
      { id: 7050000, nombre: 'Prestaciones de servicios' },
    );

    // 10 Clientes (430xxxx)
    for (let i = 1; i <= 10; i++) {
      cuentas.push({
        id: 4300000 + i,
        nombre: `CLIENTE ${i.toString().padStart(2, '0')}`
      });
    }

    // 10 Proveedores (400xxxx)
    for (let i = 1; i <= 10; i++) {
      cuentas.push({
        id: 4000000 + i,
        nombre: `PROVEEDOR ${i.toString().padStart(2, '0')}`
      });
    }

    // 2 Bancos (572xxxx)
    cuentas.push(
      { id: 5720001, nombre: 'BANCO SANTANDER' },
      { id: 5720002, nombre: 'BANCO BBVA' }
    );

    await db.collection('cuentas').insertMany(cuentas);
    console.log(`   ✓ ${cuentas.length} cuentas creadas`);

    // 6. CREAR CONCEPTOS
    console.log('\n📝 Creando conceptos...');
    const conceptos = [
      { id: 1, nombre: 'Compra mercadería' },
      { id: 2, nombre: 'Venta mercadería' },
      { id: 3, nombre: 'Prestación servicios' },
      { id: 4, nombre: 'Servicios profesionales' },
      { id: 5, nombre: 'Pago proveedor' },
      { id: 6, nombre: 'Cobro cliente' },
      { id: 7, nombre: 'Transferencia bancaria' },
      { id: 8, nombre: 'Ingreso en efectivo' },
      { id: 9, nombre: 'Pago en efectivo' },
      { id: 10, nombre: 'Factura emitida' },
      { id: 11, nombre: 'Factura recibida' },
    ];

    await db.collection('conceptos').insertMany(conceptos);
    console.log(`   ✓ ${conceptos.length} conceptos creados`);

    // 7. CREAR 100 ASIENTOS CON APUNTES
    console.log('\n📊 Creando 100 asientos con apuntes...');
    let asientosCreados = 0;
    let apuntesCreados = 0;

    const year = 2025;
    const subconta = '1';

    for (let i = 1; i <= 100; i++) {
      const idAsiento = Date.now() + i;
      const mes = random(1, 12);
      const dia = random(1, 28);
      const fecha = new Date(year, mes - 1, dia);

      // Crear asiento
      await db.collection('asientos').insertOne({
        id: idAsiento,
        year,
        subconta,
        idAsiento,
        date: fecha
      });
      asientosCreados++;

      // Decidir si es simple (2 apuntes) o compuesto (3-5 apuntes)
      const esCompuesto = Math.random() > 0.6; // 40% compuestos
      const numApuntes = esCompuesto ? random(3, 5) : 2;

      const apuntes: Array<{
        id: number;
        year: number;
        subconta: string;
        idAsiento: number;
        idApunte: number;
        idCuentaDebe: number;
        idCuentaHaber: number;
        debe: number;
        haber: number;
        idConcepto: number;
        descripcion: string;
      }> = [];
      let totalDebe = 0;
      let totalHaber = 0;

      if (!esCompuesto) {
        // Asiento simple: elegir un tipo de operación
        const tipoOperacion = random(1, 6);
        let cuentaDebe, cuentaHaber, importe, concepto;

        switch (tipoOperacion) {
          case 1: // Venta
            cuentaDebe = 4300000 + random(1, 10); // Cliente
            cuentaHaber = 7000000; // Ventas
            importe = randomFloat(100, 5000);
            concepto = 2;
            break;
          case 2: // Compra
            cuentaDebe = 6000000; // Compras
            cuentaHaber = 4000000 + random(1, 10); // Proveedor
            importe = randomFloat(100, 3000);
            concepto = 1;
            break;
          case 3: // Cobro cliente
            cuentaDebe = random(0, 1) === 0 ? 5720001 : 5720002; // Banco
            cuentaHaber = 4300000 + random(1, 10); // Cliente
            importe = randomFloat(200, 4000);
            concepto = 6;
            break;
          case 4: // Pago proveedor
            cuentaDebe = 4000000 + random(1, 10); // Proveedor
            cuentaHaber = random(0, 1) === 0 ? 5720001 : 5720002; // Banco
            importe = randomFloat(200, 3000);
            concepto = 5;
            break;
          case 5: // Ingreso efectivo
            cuentaDebe = 5700000; // Caja
            cuentaHaber = 7050000; // Prestaciones servicios
            importe = randomFloat(50, 1000);
            concepto = 8;
            break;
          case 6: // Pago efectivo
            cuentaDebe = 6230000; // Servicios profesionales
            cuentaHaber = 5700000; // Caja
            importe = randomFloat(50, 800);
            concepto = 9;
            break;
        }

        apuntes.push({
          id: Date.now() + i * 100 + 1,
          year,
          subconta,
          idAsiento,
          idApunte: 1,
          idCuentaDebe: cuentaDebe!,
          idCuentaHaber: 0,
          debe: importe!,
          haber: 0,
          idConcepto: concepto!,
          descripcion: conceptos.find(c => c.id === concepto)?.nombre || ''
        });

        apuntes.push({
          id: Date.now() + i * 100 + 2,
          year,
          subconta,
          idAsiento,
          idApunte: 2,
          idCuentaDebe: 0,
          idCuentaHaber: cuentaHaber!,
          debe: 0,
          haber: importe!,
          idConcepto: concepto!,
          descripcion: conceptos.find(c => c.id === concepto)?.nombre || ''
        });

      } else {
        // Asiento compuesto con IVA
        const baseImponible = randomFloat(500, 3000);
        const iva = baseImponible * 0.21;
        const total = baseImponible + iva;

        const esCompra = Math.random() > 0.5;

        if (esCompra) {
          // Compra con IVA
          apuntes.push({
            id: Date.now() + i * 100 + 1,
            year,
            subconta,
            idAsiento,
            idApunte: 1,
            idCuentaDebe: 6000000,
            idCuentaHaber: 0,
            debe: baseImponible,
            haber: 0,
            idConcepto: 1,
            descripcion: 'Compra mercadería'
          });

          apuntes.push({
            id: Date.now() + i * 100 + 2,
            year,
            subconta,
            idAsiento,
            idApunte: 2,
            idCuentaDebe: 4720000,
            idCuentaHaber: 0,
            debe: iva,
            haber: 0,
            idConcepto: 1,
            descripcion: 'IVA soportado'
          });

          apuntes.push({
            id: Date.now() + i * 100 + 3,
            year,
            subconta,
            idAsiento,
            idApunte: 3,
            idCuentaDebe: 0,
            idCuentaHaber: 4000000 + random(1, 10),
            debe: 0,
            haber: total,
            idConcepto: 1,
            descripcion: 'Proveedor'
          });
        } else {
          // Venta con IVA
          apuntes.push({
            id: Date.now() + i * 100 + 1,
            year,
            subconta,
            idAsiento,
            idApunte: 1,
            idCuentaDebe: 4300000 + random(1, 10),
            idCuentaHaber: 0,
            debe: total,
            haber: 0,
            idConcepto: 2,
            descripcion: 'Cliente'
          });

          apuntes.push({
            id: Date.now() + i * 100 + 2,
            year,
            subconta,
            idAsiento,
            idApunte: 2,
            idCuentaDebe: 0,
            idCuentaHaber: 7000000,
            debe: 0,
            haber: baseImponible,
            idConcepto: 2,
            descripcion: 'Venta mercadería'
          });

          apuntes.push({
            id: Date.now() + i * 100 + 3,
            year,
            subconta,
            idAsiento,
            idApunte: 3,
            idCuentaDebe: 0,
            idCuentaHaber: 4770000,
            debe: 0,
            haber: iva,
            idConcepto: 2,
            descripcion: 'IVA repercutido'
          });
        }
      }

      await db.collection('apuntes').insertMany(apuntes);
      apuntesCreados += apuntes.length;

      // Actualizar saldos para cada apunte
      const month = fecha.getMonth() + 1;
      const cuentasAfectadas = new Map<number, { debe: number; haber: number }>();

      apuntes.forEach((apunte) => {
        if (apunte.idCuentaDebe > 0) {
          const current = cuentasAfectadas.get(apunte.idCuentaDebe) || { debe: 0, haber: 0 };
          current.debe += apunte.debe;
          cuentasAfectadas.set(apunte.idCuentaDebe, current);
        }
        if (apunte.idCuentaHaber > 0) {
          const current = cuentasAfectadas.get(apunte.idCuentaHaber) || { debe: 0, haber: 0 };
          current.haber += apunte.haber;
          cuentasAfectadas.set(apunte.idCuentaHaber, current);
        }
      });

      for (const [idCuenta, movimientos] of cuentasAfectadas) {
        const saldoExistente = await db.collection('saldos').findOne({
          idCuenta,
          year,
          month,
          subconta
        });

        if (saldoExistente) {
          await db.collection('saldos').updateOne(
            { _id: saldoExistente._id },
            { $inc: { debe: movimientos.debe, haber: movimientos.haber } }
          );
        } else {
          await db.collection('saldos').insertOne({
            id: Date.now() + Math.random(),
            idCuenta,
            year,
            month,
            subconta,
            debe: movimientos.debe,
            haber: movimientos.haber
          });
        }
      }
    }

    console.log(`   ✓ ${asientosCreados} asientos creados`);
    console.log(`   ✓ ${apuntesCreados} apuntes creados`);

    // Contar saldos generados
    const saldosCount = await db.collection('saldos').countDocuments();
    console.log(`   ✓ ${saldosCount} saldos generados`);

    // 8. CREAR FACTURAS (10 por cada cliente/proveedor)
    console.log('\n🧾 Creando facturas...');
    let facturasCreadas = 0;
    let ivasCreados = 0;

    // 10 facturas emitidas por cada cliente
    for (let cliente = 1; cliente <= 10; cliente++) {
      for (let f = 1; f <= 10; f++) {
        const mes = random(1, 12);
        const dia = random(1, 28);
        const fechaFactura = new Date(year, mes - 1, dia);
        const fechaRegistro = new Date(fechaFactura.getTime() + random(0, 5) * 24 * 60 * 60 * 1000);

        const baseImponible = randomFloat(100, 5000);
        const porcentajeIva = [21, 10, 4][random(0, 2)];
        const cuotaIva = baseImponible * (porcentajeIva / 100);
        const retencion = Math.random() > 0.8 ? baseImponible * 0.15 : 0;
        const total = baseImponible + cuotaIva - retencion;

        const idFactura = Date.now() + cliente * 1000 + f;

        await db.collection('facturas').insertOne({
          id: idFactura,
          tipo: 'emitida',
          year,
          subconta,
          fechaRegistro,
          numeroRegistro: `${year}/E${cliente.toString().padStart(2, '0')}${f.toString().padStart(3, '0')}`,
          suFactura: `FE-${year}-${cliente.toString().padStart(2, '0')}-${f.toString().padStart(3, '0')}`,
          fechaFactura,
          idCuentaClienteProveedor: 4300000 + cliente,
          idCuentaContrapartida: 7000000,
          baseRetencion: retencion > 0 ? baseImponible : 0,
          porcentajeRetencion: retencion > 0 ? 15 : 0,
          importeRetencion: retencion,
          importeTotal: total
        });

        await db.collection('iva').insertOne({
          id: Date.now() + cliente * 10000 + f,
          year,
          subconta,
          idFactura,
          porcentaje: porcentajeIva,
          baseIva: baseImponible,
          cuota: cuotaIva
        });

        facturasCreadas++;
        ivasCreados++;
      }
    }

    // 10 facturas recibidas por cada proveedor
    for (let proveedor = 1; proveedor <= 10; proveedor++) {
      for (let f = 1; f <= 10; f++) {
        const mes = random(1, 12);
        const dia = random(1, 28);
        const fechaFactura = new Date(year, mes - 1, dia);
        const fechaRegistro = new Date(fechaFactura.getTime() + random(0, 5) * 24 * 60 * 60 * 1000);

        const baseImponible = randomFloat(100, 3000);
        const porcentajeIva = [21, 10, 4][random(0, 2)];
        const cuotaIva = baseImponible * (porcentajeIva / 100);
        const total = baseImponible + cuotaIva;

        const idFactura = Date.now() + 100000 + proveedor * 1000 + f;

        await db.collection('facturas').insertOne({
          id: idFactura,
          tipo: 'recibida',
          year,
          subconta,
          fechaRegistro,
          numeroRegistro: `${year}/R${proveedor.toString().padStart(2, '0')}${f.toString().padStart(3, '0')}`,
          suFactura: `PR-${year}-${proveedor.toString().padStart(2, '0')}-${f.toString().padStart(3, '0')}`,
          fechaFactura,
          idCuentaClienteProveedor: 4000000 + proveedor,
          idCuentaContrapartida: 6000000,
          baseRetencion: 0,
          porcentajeRetencion: 0,
          importeRetencion: 0,
          importeTotal: total
        });

        await db.collection('iva').insertOne({
          id: Date.now() + 200000 + proveedor * 10000 + f,
          year,
          subconta,
          idFactura,
          porcentaje: porcentajeIva,
          baseIva: baseImponible,
          cuota: cuotaIva
        });

        facturasCreadas++;
        ivasCreados++;
      }
    }

    console.log(`   ✓ ${facturasCreadas} facturas creadas`);
    console.log(`   ✓ ${ivasCreados} líneas de IVA creadas`);

    console.log('\n✅ Base de datos poblada correctamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - Ejercicio: 2025`);
    console.log(`   - Subconta: 1`);
    console.log(`   - Niveles: ${niveles.length}`);
    console.log(`   - Cuentas: ${cuentas.length}`);
    console.log(`   - Conceptos: ${conceptos.length}`);
    console.log(`   - Asientos: ${asientosCreados}`);
    console.log(`   - Apuntes: ${apuntesCreados}`);
    console.log(`   - Facturas: ${facturasCreadas}`);
    console.log(`   - Líneas IVA: ${ivasCreados}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n👋 Desconectado de MongoDB');
  }
}

seed();
