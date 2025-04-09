-- Script para generar datos de prueba para los tres conjuntos residenciales

-- Insertar información del complejo residencial en cada esquema de tenant
INSERT INTO tenant_cj0001."ResidentialComplex" 
(id, name, "totalUnits", "adminEmail", "adminName", "adminPhone", address, city, state, country, "propertyTypes")
SELECT 
  id, name, "totalUnits", "adminEmail", "adminName", "adminPhone", address, city, state, country, "propertyTypes"
FROM armonia."ResidentialComplex"
WHERE id = 1;

INSERT INTO tenant_cj0002."ResidentialComplex" 
(id, name, "totalUnits", "adminEmail", "adminName", "adminPhone", address, city, state, country, "propertyTypes")
SELECT 
  id, name, "totalUnits", "adminEmail", "adminName", "adminPhone", address, city, state, country, "propertyTypes"
FROM armonia."ResidentialComplex"
WHERE id = 3;

INSERT INTO tenant_cj0003."ResidentialComplex" 
(id, name, "totalUnits", "adminEmail", "adminName", "adminPhone", address, city, state, country, "propertyTypes")
SELECT 
  id, name, "totalUnits", "adminEmail", "adminName", "adminPhone", address, city, state, country, "propertyTypes"
FROM armonia."ResidentialComplex"
WHERE id = 4;

-- Insertar administradores en cada esquema
INSERT INTO tenant_cj0001."User" 
(id, email, name, password, "complexId", role)
SELECT 
  id, email, name, password, "complexId", role
FROM armonia."User"
WHERE "complexId" = 1;

INSERT INTO tenant_cj0002."User" 
(id, email, name, password, "complexId", role)
SELECT 
  id, email, name, password, "complexId", role
FROM armonia."User"
WHERE "complexId" = 3;

INSERT INTO tenant_cj0003."User" 
(id, email, name, password, "complexId", role)
SELECT 
  id, email, name, password, "complexId", role
FROM armonia."User"
WHERE "complexId" = 4;

-- Crear servicios comunes para todos los conjuntos
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
    
    -- Insertar servicios comunes
    EXECUTE format('
      INSERT INTO %I."Service" (name, description, capacity, "startTime", "endTime", rules, status, "complexId", cost) VALUES
      (''Salón Comunal'', ''Espacio para reuniones y eventos sociales'', 30, ''08:00'', ''22:00'', ''No mascotas. Limpieza a cargo del usuario.'', ''active'', %L, 2),
      (''Piscina'', ''Área recreativa con piscina para adultos y niños'', 15, ''09:00'', ''18:00'', ''Obligatorio usar gorro de baño. Niños con supervisión.'', ''active'', %L, 2),
      (''Cancha de Tenis'', ''Cancha reglamentaria con iluminación'', 4, ''07:00'', ''21:00'', ''Calzado adecuado obligatorio. Máximo 2 horas por reserva.'', ''active'', %L, 2),
      (''Zona BBQ'', ''Área para asados con 2 parrillas'', 10, ''10:00'', ''20:00'', ''Traer propios utensilios. Limpieza obligatoria al finalizar.'', ''active'', %L, 2)
    ', schema_name, complex_id, complex_id, complex_id, complex_id);
  END LOOP;
END $$;

-- Crear propiedades, residentes, mascotas y vehículos para cada conjunto
-- Conjunto 1: Casas del Bosque (8 casas)
DO $$
DECLARE
  i INTEGER;
  complex_id INTEGER = 1;
  property_id INTEGER;
  user_id INTEGER;
  resident_id INTEGER;
  
  -- Arreglos para nombres aleatorios
  first_names TEXT[] := ARRAY['Juan', 'María', 'Carlos', 'Ana', 'José', 'Laura', 'Pedro', 'Sofía', 'Luis', 'Valentina', 'Andrés', 'Camila', 'Diego', 'Isabella', 'Gabriel', 'Mariana', 'Javier', 'Alejandra', 'Daniel', 'Natalia', 'Ricardo', 'Paula', 'Eduardo', 'Catalina', 'Miguel', 'Victoria', 'Fernando', 'Juliana', 'Roberto', 'Carolina'];
  last_names TEXT[] := ARRAY['González', 'Rodríguez', 'López', 'Martínez', 'Pérez', 'Gómez', 'Fernández', 'Sánchez', 'Ramírez', 'Torres', 'Díaz', 'Vargas', 'Morales', 'Ortiz', 'Rojas', 'Hernández', 'Jiménez', 'Castro', 'Ruiz', 'Álvarez', 'Suárez', 'Romero', 'Moreno', 'Molina', 'Gutiérrez', 'Delgado', 'Contreras', 'Silva', 'Mendoza', 'Flores'];
  pet_names TEXT[] := ARRAY['Luna', 'Rocky', 'Max', 'Bella', 'Toby', 'Linda', 'Zeus', 'Lola', 'Rex', 'Nina', 'Thor', 'Coco', 'Leo', 'Nala', 'Bruno', 'Kira', 'Simba', 'Kiara', 'Buddy', 'Mía', 'Jack', 'Princesa', 'Lucas', 'Canela'];
  pet_types TEXT[] := ARRAY['Perro', 'Gato', 'Perro', 'Gato', 'Perro', 'Gato', 'Perro', 'Gato'];
  car_makes TEXT[] := ARRAY['Toyota', 'Honda', 'Mazda', 'Nissan', 'Chevrolet', 'Ford', 'Kia', 'Hyundai', 'Renault', 'Volkswagen'];
  car_models TEXT[] := ARRAY['Corolla', 'Civic', 'CX-5', 'Sentra', 'Cruze', 'Fiesta', 'Rio', 'Elantra', 'Logan', 'Golf'];
  car_colors TEXT[] := ARRAY['Rojo', 'Azul', 'Negro', 'Blanco', 'Gris', 'Plateado', 'Verde', 'Amarillo', 'Naranja', 'Morado'];
  car_types TEXT[] := ARRAY['Sedan', 'SUV', 'Hatchback', 'Camioneta', 'Pickup'];
  
  pwd TEXT := '$2b$10$wdhTuxtMFEslR8L1SuZgEOAK0STVuuO7K.raMqyrge5mhmi4b/1Lm'; -- Contraseña encriptada
  random_idx INTEGER;
  random_name TEXT;
  random_last TEXT;
  email TEXT;
  plate TEXT;
  
BEGIN
  -- Crear propiedades para Conjunto 1
  FOR i IN 1..8 LOOP
    -- Insertar propiedad
    INSERT INTO tenant_cj0001."Property" ("complexId", "unitNumber", type, area, status, block, zone)
    VALUES (complex_id, 'Casa ' || i, 'HOUSE', 120 + (i * 10), 'OCCUPIED', 'A', 'Norte')
    RETURNING id INTO property_id;
    
    -- Crear 4 residentes por propiedad
    FOR j IN 1..4 LOOP
      -- Seleccionar nombres aleatorios
      random_idx := floor(random() * array_length(first_names, 1)) + 1;
      random_name := first_names[random_idx];
      random_idx := floor(random() * array_length(last_names, 1)) + 1;
      random_last := last_names[random_idx];
      
      -- Crear email
      email := lower(random_name) || '.' || lower(random_last) || floor(random() * 100) || '@example.com';
      
      -- Crear usuario y residente
      IF j = 1 THEN -- El primer residente es propietario y tiene usuario
        INSERT INTO tenant_cj0001."User" (email, name, password, "complexId", role)
        VALUES (email, random_name || ' ' || random_last, pwd, complex_id, 'RESIDENT')
        RETURNING id INTO user_id;
        
        INSERT INTO tenant_cj0001."Resident" ("userId", "propertyId", "complexId", "isPrimary", status, whatsapp, dni, email, name, age)
        VALUES (user_id, property_id, complex_id, TRUE, 'ENABLED', '+57 300' || (1000000 + floor(random() * 9000000))::TEXT, '1' || (10000000 + floor(random() * 90000000))::TEXT, email, random_name || ' ' || random_last, 25 + floor(random() * 40)::INTEGER)
        RETURNING id INTO resident_id;
      ELSE -- Otros residentes sin usuario (familiares)
        INSERT INTO tenant_cj0001."Resident" ("propertyId", "complexId", "isPrimary", status, whatsapp, dni, email, name, age)
        VALUES (property_id, complex_id, FALSE, 'ENABLED', '+57 300' || (1000000 + floor(random() * 9000000))::TEXT, '1' || (10000000 + floor(random() * 90000000))::TEXT, email, random_name || ' ' || random_last, 5 + floor(random() * 70)::INTEGER)
        RETURNING id INTO resident_id;
      END IF;
      
      -- Si es el primer residente, agregar mascota
      IF j = 1 THEN
        random_idx := floor(random() * array_length(pet_names, 1)) + 1;
        INSERT INTO tenant_cj0001."Pet" (name, type, breed, "residentId", "propertyId")
        VALUES (
          pet_names[random_idx], 
          pet_types[1 + floor(random() * 2)::INTEGER], 
          'Mestizo', 
          resident_id, 
          property_id
        );
      END IF;
    END LOOP;
    
    -- Agregar 2 vehículos por propiedad
    FOR j IN 1..2 LOOP
      plate := chr(65 + floor(random() * 26)) || chr(65 + floor(random() * 26)) || chr(65 + floor(random() * 26)) || '-' || (floor(random() * 900) + 100)::TEXT;
      
      INSERT INTO tenant_cj0001."Vehicle" (make, model, color, plate, type, "residentId", "propertyId")
      VALUES (
        car_makes[1 + floor(random() * array_length(car_makes, 1))::INTEGER],
        car_models[1 + floor(random() * array_length(car_models, 1))::INTEGER],
        car_colors[1 + floor(random() * array_length(car_colors, 1))::INTEGER],
        plate,
        car_types[1 + floor(random() * array_length(car_types, 1))::INTEGER],
        (SELECT id FROM tenant_cj0001."Resident" WHERE "propertyId" = property_id AND "isPrimary" = TRUE),
        property_id
      );
    END LOOP;
  END LOOP;
END $$;