-- Continuación del script de datos de prueba (Parte 2)

-- Crear asambleas y votaciones para cada conjunto
DO $$
DECLARE
  schemas TEXT[] := ARRAY['tenant_cj0001', 'tenant_cj0002', 'tenant_cj0003'];
  schema_name TEXT;
  complex_id INTEGER;
  admin_id INTEGER;
  assembly_id INTEGER;
  assembly_id2 INTEGER;
  assembly_id3 INTEGER;
  question_id INTEGER;
  question_id2 INTEGER;
  residents RECORD;
  resident_ids INTEGER[];
  i INTEGER := 0;
BEGIN
  FOREACH schema_name IN ARRAY schemas
  LOOP
    -- Obtener el ID del complejo y del administrador
    EXECUTE format('SELECT id FROM %I."ResidentialComplex" LIMIT 1', schema_name)
    INTO complex_id;
    
    EXECUTE format('SELECT id FROM %I."User" WHERE role = ''COMPLEX_ADMIN'' OR (role = ''ADMIN'' AND "complexId" = %L) LIMIT 1', schema_name, complex_id)
    INTO admin_id;
    
    IF admin_id IS NULL THEN
      -- Usar el primer residente como organizador si no hay admin
      EXECUTE format('SELECT "userId" FROM %I."Resident" WHERE "isPrimary" = TRUE LIMIT 1', schema_name)
      INTO admin_id;
    END IF;
    
    -- Crear asamblea ordinaria anual
    EXECUTE format('
      INSERT INTO %I."Assembly" (
        title, 
        date, 
        status, 
        quorum, 
        "organizerId", 
        "complexId", 
        type, 
        description, 
        agenda
      ) VALUES (
        ''Asamblea Ordinaria Anual 2025'', 
        ''2025-03-15 10:00:00'', 
        ''COMPLETED'', 
        75.5, 
        %L, 
        %L, 
        ''ORDINARY'', 
        ''Asamblea ordinaria anual para la revisión de estados financieros y proyectos del año.'', 
        ''[{"time": "10:00", "topic": "Apertura y verificación de quórum"}, {"time": "10:15", "topic": "Lectura del orden del día"}, {"time": "10:30", "topic": "Informe del administrador"}, {"time": "11:00", "topic": "Estados financieros"}, {"time": "11:30", "topic": "Propuesta de proyectos"}, {"time": "12:30", "topic": "Elección de revisor fiscal"}, {"time": "13:00", "topic": "Proposiciones y varios"}]''::jsonb
      ) RETURNING id', 
      schema_name, admin_id, complex_id
    ) INTO assembly_id;
    
    -- Crear primera asamblea extraordinaria (Cancha de pádel)
    EXECUTE format('
      INSERT INTO %I."Assembly" (
        title, 
        date, 
        status, 
        quorum, 
        "organizerId", 
        "complexId", 
        type, 
        description, 
        agenda
      ) VALUES (
        ''Asamblea Extraordinaria - Proyecto Cancha de Pádel'', 
        ''2025-05-20 18:00:00'', 
        ''COMPLETED'', 
        82.3, 
        %L, 
        %L, 
        ''EXTRAORDINARY'', 
        ''Asamblea extraordinaria para aprobar el proyecto de construcción de una cancha de pádel.'', 
        ''[{"time": "18:00", "topic": "Verificación de quórum"}, {"time": "18:10", "topic": "Presentación del proyecto"}, {"time": "18:30", "topic": "Presupuesto y financiación"}, {"time": "19:00", "topic": "Votación del proyecto"}, {"time": "19:30", "topic": "Cierre"}]''::jsonb
      ) RETURNING id', 
      schema_name, admin_id, complex_id
    ) INTO assembly_id2;
    
    -- Crear segunda asamblea extraordinaria (Pintura de fachadas)
    EXECUTE format('
      INSERT INTO %I."Assembly" (
        title, 
        date, 
        status, 
        quorum, 
        "organizerId", 
        "complexId", 
        type, 
        description, 
        agenda
      ) VALUES (
        ''Asamblea Extraordinaria - Renovación de Fachadas'', 
        ''2025-07-10 19:00:00'', 
        ''COMPLETED'', 
        78.9, 
        %L, 
        %L, 
        ''EXTRAORDINARY'', 
        ''Asamblea extraordinaria para aprobar el proyecto de pintura y renovación de fachadas.'', 
        ''[{"time": "19:00", "topic": "Verificación de quórum"}, {"time": "19:10", "topic": "Presentación de propuestas de diseño"}, {"time": "19:40", "topic": "Presupuesto y cuotas extraordinarias"}, {"time": "20:10", "topic": "Votación de propuestas"}, {"time": "20:30", "topic": "Cronograma de ejecución"}, {"time": "20:45", "topic": "Cierre"}]''::jsonb
      ) RETURNING id', 
      schema_name, admin_id, complex_id
    ) INTO assembly_id3;
    
    -- Crear preguntas de votación para la cancha de pádel
    EXECUTE format('
      INSERT INTO %I."VotingQuestion" (
        "assemblyId",
        text,
        "yesVotes",
        "noVotes",
        "nrVotes",
        "isOpen",
        "votingEndTime"
      ) VALUES (
        %L,
        ''¿Aprueba la construcción de una cancha de pádel con una inversión de USD 15,000?'',
        18,
        5,
        2,
        FALSE,
        ''2025-05-20 19:30:00''
      ) RETURNING id', 
      schema_name, assembly_id2
    ) INTO question_id;
    
    -- Crear preguntas de votación para la pintura de fachadas
    EXECUTE format('
      INSERT INTO %I."VotingQuestion" (
        "assemblyId",
        text,
        "yesVotes",
        "noVotes",
        "nrVotes",
        "isOpen",
        "votingEndTime"
      ) VALUES (
        %L,
        ''¿Aprueba el proyecto de renovación y pintura de fachadas con un costo de USD 12,000?'',
        22,
        3,
        1,
        FALSE,
        ''2025-07-10 20:30:00''
      ) RETURNING id', 
      schema_name, assembly_id3
    ) INTO question_id2;
    
    -- Obtener los residentes primarios para registrar sus votos
    EXECUTE format('
      SELECT array_agg(id) AS ids
      FROM %I."Resident"
      WHERE "isPrimary" = TRUE',
      schema_name
    ) INTO resident_ids;
    
    -- Registrar votos para la cancha de pádel
    i := 0;
    IF resident_ids IS NOT NULL THEN
      FOREACH resident_id IN ARRAY resident_ids
      LOOP
        i := i + 1;
        -- Decidir el voto basado en el índice (para distribuir)
        IF i % 5 = 0 THEN
          -- Votar "No"
          EXECUTE format('
            INSERT INTO %I."Vote" ("votingQuestionId", "residentId", vote)
            VALUES (%L, %L, ''No'')',
            schema_name, question_id, resident_id
          );
        ELSIF i % 4 = 0 THEN
          -- Abstención
          EXECUTE format('
            INSERT INTO %I."Vote" ("votingQuestionId", "residentId", vote)
            VALUES (%L, %L, ''Abstención'')',
            schema_name, question_id, resident_id
          );
        ELSE
          -- Votar "Sí"
          EXECUTE format('
            INSERT INTO %I."Vote" ("votingQuestionId", "residentId", vote)
            VALUES (%L, %L, ''Sí'')',
            schema_name, question_id, resident_id
          );
        END IF;
      END LOOP;
    END IF;
    
    -- Registrar asistencia a las asambleas
    IF resident_ids IS NOT NULL THEN
      FOREACH resident_id IN ARRAY resident_ids
      LOOP
        -- Asistencia a la asamblea ordinaria
        EXECUTE format('
          INSERT INTO %I."Attendance" ("assemblyId", "residentId", confirmed, verified, attendance)
          VALUES (%L, %L, TRUE, TRUE, ''Presente'')',
          schema_name, assembly_id, resident_id
        );
        
        -- Asistencia a la asamblea extraordinaria de cancha de pádel
        IF resident_id % 4 != 0 THEN -- 75% de asistencia
          EXECUTE format('
            INSERT INTO %I."Attendance" ("assemblyId", "residentId", confirmed, verified, attendance)
            VALUES (%L, %L, TRUE, TRUE, ''Presente'')',
            schema_name, assembly_id2, resident_id
          );
        END IF;
        
        -- Asistencia a la asamblea extraordinaria de fachadas
        IF resident_id % 5 != 0 THEN -- 80% de asistencia
          EXECUTE format('
            INSERT INTO %I."Attendance" ("assemblyId", "residentId", confirmed, verified, attendance)
            VALUES (%L, %L, TRUE, TRUE, ''Presente'')',
            schema_name, assembly_id3, resident_id
          );
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- Crear proyectos aprobados en las asambleas para cada conjunto
DO $$
DECLARE
  schemas TEXT[] := ARRAY['tenant_cj0001', 'tenant_cj0002', 'tenant_cj0003'];
  schema_name TEXT;
  complex_id INTEGER;
BEGIN
  FOREACH schema_name IN ARRAY schemas
  LOOP
    -- Obtener el ID del complejo
    EXECUTE format('SELECT id FROM %I."ResidentialComplex" LIMIT 1', schema_name)
    INTO complex_id;
    
    -- Proyecto Cancha de Pádel
    EXECUTE format('
      INSERT INTO %I."Project" (
        name,
        description,
        budget,
        "startDate",
        "endDate",
        status,
        progress,
        "complexId"
      ) VALUES (
        ''Construcción Cancha de Pádel'',
        ''Proyecto para la construcción de una cancha de pádel con iluminación, cerramiento y equipamiento'',
        15000,
        ''2025-06-01'',
        ''2025-08-30'',
        ''IN_PROGRESS'',
        35.5,
        %L
      )',
      schema_name, complex_id
    );
    
    -- Proyecto Pintura de Fachadas
    EXECUTE format('
      INSERT INTO %I."Project" (
        name,
        description,
        budget,
        "startDate",
        "endDate",
        status,
        progress,
        "complexId"
      ) VALUES (
        ''Renovación y Pintura de Fachadas'',
        ''Proyecto para la reparación, preparación y pintura de todas las fachadas del conjunto'',
        12000,
        ''2025-08-01'',
        ''2025-10-30'',
        ''PLANNED'',
        0,
        %L
      )',
      schema_name, complex_id
    );
  END LOOP;
END $$;

-- Crear cuotas y pagos para cada conjunto
DO $$
DECLARE
  schemas TEXT[] := ARRAY['tenant_cj0001', 'tenant_cj0002', 'tenant_cj0003'];
  schema_name TEXT;
  complex_id INTEGER;
  admin_id INTEGER;
  property_record RECORD;
  fee_id INTEGER;
BEGIN
  FOREACH schema_name IN ARRAY schemas
  LOOP
    -- Obtener el ID del complejo y administrador
    EXECUTE format('SELECT id FROM %I."ResidentialComplex" LIMIT 1', schema_name)
    INTO complex_id;
    
    EXECUTE format('SELECT id FROM %I."User" WHERE role = ''COMPLEX_ADMIN'' OR (role = ''ADMIN'' AND "complexId" = %L) LIMIT 1', schema_name, complex_id)
    INTO admin_id;
    
    IF admin_id IS NULL THEN
      -- Usar el primer residente como administrador si no hay admin
      EXECUTE format('SELECT "userId" FROM %I."Resident" WHERE "isPrimary" = TRUE LIMIT 1', schema_name)
      INTO admin_id;
    END IF;
    
    -- Obtener todas las propiedades del conjunto
    FOR property_record IN EXECUTE format('SELECT id, "unitNumber" FROM %I."Property" WHERE "complexId" = %L', schema_name, complex_id)
    LOOP
      -- Cuota de administración ordinaria Abril 2025
      EXECUTE format('
        INSERT INTO %I."Fee" (
          amount,
          "dueDate",
          status,
          type,
          concept,
          "propertyId",
          "authorId",
          "complexId",
          unit
        ) VALUES (
          100,
          ''2025-04-10'',
          ''PAID'',
          ''ORDINARY'',
          ''Cuota de administración Abril 2025'',
          %L,
          %L,
          %L,
          %L
        ) RETURNING id',
        schema_name, property_record.id, admin_id, complex_id, property_record.unitNumber
      ) INTO fee_id;
      
      -- Registro del pago de Abril
      EXECUTE format('
        INSERT INTO %I."Payment" (
          amount,
          method,
          "transactionId",
          notes,
          "feeId",
          "ownerId"
        ) VALUES (
          100,
          ''TRANSFER'',
          ''TX'' || floor(random() * 1000000)::TEXT,
          ''Pago recibido el día 8 de Abril'',
          %L,
          (SELECT "userId" FROM %I."Resident" WHERE "propertyId" = %L AND "isPrimary" = TRUE LIMIT 1)
        )',
        schema_name, fee_id, schema_name, property_record.id
      );
      
      -- Cuota de administración ordinaria Mayo 2025
      EXECUTE format('
        INSERT INTO %I."Fee" (
          amount,
          "dueDate",
          status,
          type,
          concept,
          "propertyId",
          "authorId",
          "complexId",
          unit
        ) VALUES (
          100,
          ''2025-05-10'',
          ''PENDING'',
          ''ORDINARY'',
          ''Cuota de administración Mayo 2025'',
          %L,
          %L,
          %L,
          %L
        )',
        schema_name, property_record.id, admin_id, complex_id, property_record.unitNumber
      );
      
      -- Cuota extraordinaria para cancha de pádel
      EXECUTE format('
        INSERT INTO %I."Fee" (
          amount,
          "dueDate",
          status,
          type,
          concept,
          "propertyId",
          "authorId",
          "complexId",
          unit
        ) VALUES (
          500,
          ''2025-06-15'',
          ''PENDING'',
          ''EXTRAORDINARY'',
          ''Cuota extraordinaria para construcción cancha de pádel'',
          %L,
          %L,
          %L,
          %L
        )',
        schema_name, property_record.id, admin_id, complex_id, property_record.unitNumber
      );
    END LOOP;
  END LOOP;
END $$;

-- Crear reservas de servicios comunes para cada conjunto
DO $$
DECLARE
  schemas TEXT[] := ARRAY['tenant_cj0001', 'tenant_cj0002', 'tenant_cj0003'];
  schema_name TEXT;
  service_record RECORD;
  resident_record RECORD;
  start_time TIMESTAMP;
  end_time TIMESTAMP;
BEGIN
  FOREACH schema_name IN ARRAY schemas
  LOOP
    -- Obtener todos los servicios del conjunto
    FOR service_record IN EXECUTE format('SELECT id, name, cost FROM %I."Service"', schema_name)
    LOOP
      -- Obtener residentes primarios
      FOR resident_record IN EXECUTE format('SELECT id, "propertyId" FROM %I."Resident" WHERE "isPrimary" = TRUE', schema_name)
      LOOP
        -- Crear reservas aleatorias para cada servicio
        IF random() > 0.3 THEN -- 70% de probabilidad de crear reserva
          -- Reserva en el futuro (próximos 30 días)
          start_time := NOW() + (random() * 30 || ' days')::INTERVAL + (floor(random() * 12) || ' hours')::INTERVAL;
          end_time := start_time + '2 hours'::INTERVAL;
          
          EXECUTE format('
            INSERT INTO %I."Reservation" (
              "serviceId",
              "residentId",
              "startTime",
              "endTime",
              status,
              "paymentStatus",
              amount
            ) VALUES (
              %L,
              %L,
              %L,
              %L,
              ''CONFIRMED'',
              ''PENDING'',
              %L
            )',
            schema_name, service_record.id, resident_record.id, start_time, end_time, service_record.cost
          );
        END IF;
        
        -- Crear algunas reservas históricas (últimos 30 días)
        IF random() > 0.5 THEN -- 50% de probabilidad de crear reserva histórica
          start_time := NOW() - (random() * 30 || ' days')::INTERVAL + (floor(random() * 12) || ' hours')::INTERVAL;
          end_time := start_time + '2 hours'::INTERVAL;
          
          EXECUTE format('
            INSERT INTO %I."Reservation" (
              "serviceId",
              "residentId",
              "startTime",
              "endTime",
              status,
              "paymentStatus",
              amount
            ) VALUES (
              %L,
              %L,
              %L,
              %L,
              ''COMPLETED'',
              ''PAID'',
              %L
            )',
            schema_name, service_record.id, resident_record.id, start_time, end_time, service_record.cost
          );
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Crear PQRs (Peticiones, Quejas y Reclamos) para cada conjunto
DO $$
DECLARE
  schemas TEXT[] := ARRAY['tenant_cj0001', 'tenant_cj0002', 'tenant_cj0003'];
  schema_name TEXT;
  complex_id INTEGER;
  resident_record RECORD;
  pqr_types TEXT[] := ARRAY['PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA'];
  priorities TEXT[] := ARRAY['ALTA', 'MEDIA', 'BAJA'];
  statuses TEXT[] := ARRAY['OPEN', 'IN_PROCESS', 'RESOLVED', 'CLOSED'];
  pqr_titles TEXT[] := ARRAY[
    'Solicitud de mantenimiento en área común', 
    'Ruido excesivo de vecinos', 
    'Problemas con el sistema de agua', 
    'Sugerencia para mejorar iluminación', 
    'Queja sobre mascotas sin correa', 
    'Problema con el parqueadero', 
    'Solicitud de información sobre cuotas',
    'Filtración de agua en apartamento',
    'Solicitud para instalación de cámaras',
    'Queja sobre uso indebido de zonas comunes'
  ];
  pqr_descriptions TEXT[] := ARRAY[
    'Solicito mantenimiento urgente en el área de juegos infantiles debido a deterioro en los columpios.',
    'Los vecinos del apartamento superior generan ruido excesivo en horas de la noche, especialmente los fines de semana.',
    'Hay baja presión de agua en mi apartamento desde hace una semana, requiero revisión técnica.',
    'Sugiero mejorar la iluminación en el área de parqueaderos ya que resulta insuficiente en horas de la noche.',
    'Algunos residentes no llevan sus mascotas con correa en las zonas comunes, lo cual genera inseguridad.',
    'Mi espacio de parqueadero asignado está siendo utilizado frecuentemente por otro residente.',
    'Solicito información detallada sobre el cálculo de las cuotas extraordinarias del proyecto de fachadas.',
    'Presento filtración de agua proveniente del techo que está afectando paredes y muebles.',
    'Solicito la instalación de cámaras adicionales en el área de juegos para mayor seguridad de los niños.',
    'Algunos residentes utilizan la zona BBQ sin reserva previa, ocupándola cuando otros la han reservado.'
  ];
  random_idx INTEGER;
BEGIN
  FOREACH schema_name IN ARRAY schemas
  LOOP
    -- Obtener el ID del complejo
    EXECUTE format('SELECT id FROM %I."ResidentialComplex" LIMIT 1', schema_name)
    INTO complex_id;
    
    -- Para cada residente primario, crear algunas PQRs
    FOR resident_record IN EXECUTE format('
      SELECT r.id, r."userId" 
      FROM %I."Resident" r 
      WHERE r."isPrimary" = TRUE AND r."userId" IS NOT NULL', 
      schema_name
    )
    LOOP
      -- Crear entre 0 y 3 PQRs por residente
      FOR i IN 1..floor(random() * 3)::INTEGER LOOP
        random_idx := 1 + floor(random() * array_length(pqr_titles, 1))::INTEGER;
        
        EXECUTE format('
          INSERT INTO %I."PQR" (
            type,
            title,
            description,
            priority,
            status,
            "userId",
            "complexId"
          ) VALUES (
            %L,
            %L,
            %L,
            %L,
            %L,
            %L,
            %L
          )',
          schema_name,
          pqr_types[1 + floor(random() * array_length(pqr_types, 1))::INTEGER],
          pqr_titles[random_idx],
          pqr_descriptions[random_idx],
          priorities[1 + floor(random() * array_length(priorities, 1))::INTEGER],
          statuses[1 + floor(random() * array_length(statuses, 1))::INTEGER],
          resident_record."userId",
          complex_id
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Crear presupuestos anuales para cada conjunto
DO $$
DECLARE
  schemas TEXT[] := ARRAY['tenant_cj0001', 'tenant_cj0002', 'tenant_cj0003'];
  schema_name TEXT;
  complex_id INTEGER;
  admin_id INTEGER;
BEGIN
  FOREACH schema_name IN ARRAY schemas
  LOOP
    -- Obtener el ID del complejo y administrador
    EXECUTE format('SELECT id FROM %I."ResidentialComplex" LIMIT 1', schema_name)
    INTO complex_id;
    
    EXECUTE format('SELECT id FROM %I."User" WHERE role = ''COMPLEX_ADMIN'' OR (role = ''ADMIN'' AND "complexId" = %L) LIMIT 1', schema_name, complex_id)
    INTO admin_id;
    
    IF admin_id IS NULL THEN
      -- Usar el primer residente como administrador si no hay admin
      EXECUTE format('SELECT "userId" FROM %I."Resident" WHERE "isPrimary" = TRUE LIMIT 1', schema_name)
      INTO admin_id;
    END IF;
    
    -- Presupuesto 2025
    EXECUTE format('
      INSERT INTO %I."Budget" (
        year,
        amount,
        description,
        "authorId",
        "complexId"
      ) VALUES (
        2025,
        48000,
        ''Presupuesto anual que incluye gastos de administración, mantenimiento, servicios públicos, seguridad y fondo de reserva'',
        %L,
        %L
      )',
      schema_name, admin_id, complex_id
    );
  END LOOP;
END $$;

-- Crear personal de servicio y vigilancia para cada conjunto
DO $$
DECLARE
  schemas TEXT[] := ARRAY['tenant_cj0001', 'tenant_cj0002', 'tenant_cj0003'];
  schema_name TEXT;
  complex_id INTEGER;
BEGIN
  FOREACH schema_name IN ARRAY schemas
  LOOP
    -- Obtener el ID del complejo
    EXECUTE format('SELECT id FROM %I."ResidentialComplex" LIMIT 1', schema_name)
    INTO complex_id;
    
    -- Insertar personal
    EXECUTE format('
      INSERT INTO %I."Staff" (name, role, "complexId") VALUES
      (''Jorge Ramírez'', ''SECURITY'', %L),
      (''María Patiño'', ''RECEPTIONIST'', %L),
      (''Carlos Durán'', ''MAINTENANCE'', %L),
      (''Luisa Fernández'', ''SECURITY'', %L),
      (''Roberto Guzmán'', ''GARDENER'', %L),
      (''Patricia Osorio'', ''CLEANER'', %L)
    ',
      schema_name, complex_id, complex_id, complex_id, complex_id, complex_id, complex_id
    );
  END LOOP;
END $$;
