-- Datos iniciales (tomados del dump de MySQL Dump20250320.sql)
-- Las cuentas "admin" y "superadmin" usan la contraseña: admin123

INSERT INTO departamentos (id, nombre, descripcion, created_at, updated_at) VALUES
(1, 'Audiovisual', 'Departamento encargado de equipos audiovisuales para clases y eventos', '2025-03-20 03:24:02', '2025-03-20 03:24:02'),
(2, 'Tecnología', 'Departamento encargado de equipos tecnológicos y herramientas informáticas', '2025-03-20 03:24:02', '2025-03-20 03:24:02');

INSERT INTO usuarios (id, matricula, email, nombre, apellido, password, rol, created_at, updated_at) VALUES
(1, 'admin', 'admin@unphu.edu.do', 'Administrador', 'Sistema', '$2b$10$gdvO3CrEWVmJ98CMBHZ1GeDp5pQ6wcChVRVUqVUwnMsJpkOhp/jlu', 'admin', '2025-03-20 03:24:02', '2025-03-20 03:24:02'),
(2, 'lc22-1392', 'lc22-1392@unphu.edu.do', 'Luis', 'Calderon', '$2b$10$X21ueO8oKgYiYNYjH2XrPOxuV/a26a0OPcN.ZbIBTuwI5N.St1MIO', 'usuario', '2025-03-20 03:52:20', '2025-03-20 03:52:20'),
(3, 'superadmin', 'superadmin@unphu.edu.do', 'Super', 'Admin', '$2b$10$gdvO3CrEWVmJ98CMBHZ1GeDp5pQ6wcChVRVUqVUwnMsJpkOhp/jlu', 'admin', '2025-03-20 04:35:41', '2025-03-20 04:41:08'),
(4, 'jm18-0990', 'jm18-0990@unphu.edu.do', 'Juan', 'Miliano', '$2b$10$kb50fRq2FvJOPuBlMcnRBubirhlgMNXoOoG1OwIvB9eCDNcobxyAe', 'usuario', '2025-03-20 18:05:01', '2025-03-20 18:05:01'),
(5, 'mariomesa', 'mariomesa@unphu.edu.do', 'Mario', 'Mesa', '$2b$10$MIq947WVQoKZvvc9YV1i0.my4lRRbebW33rrMeaqBTJfrtQ2CqWFy', 'usuario', '2025-03-20 18:16:15', '2025-03-20 18:16:15');

INSERT INTO items (id, nombre, descripcion, departamento_id, cantidad_total, cantidad_disponible, estado, created_at, updated_at) VALUES
(1, 'Cable HDMI', 'Cable de alta calidad para transmisión de señal de video y audio en alta definición. Compatible con televisores, proyectores y dispositivos de entretenimiento.', 1, 20, 20, 'Disponible', '2025-03-20 03:24:02', '2025-03-20 03:24:02'),
(2, 'Cable VGA', 'Cable de conexión VGA para equipos de video, usado comúnmente en proyectores y monitores de computadoras. Ideal para transmitir señal analógica.', 1, 20, 20, 'Disponible', '2025-03-20 03:24:02', '2025-03-20 17:30:02'),
(3, 'Adaptador HDMI a VGA', 'Adaptador para convertir señales de video digital HDMI a analógico VGA. Permite conectar dispositivos modernos como laptops a monitores o proyectores antiguos.', 1, 10, 10, 'Disponible', '2025-03-20 03:24:02', '2025-03-20 03:24:02'),
(4, 'Cables HDMI', 'Cables para conectar dispositivos HDMI a monitores o proyectores', 2, 15, 15, 'Disponible', '2025-03-20 03:24:02', '2025-03-20 03:24:02'),
(5, 'Adaptador HDMI a DisplayPORT', 'Adaptador para convertir señales HDMI a DisplayPort', 2, 8, 8, 'Disponible', '2025-03-20 03:24:02', '2025-03-20 03:24:02'),
(6, 'Cables VGA', 'Cables de conexión VGA estándar', 2, 10, 10, 'Disponible', '2025-03-20 03:24:02', '2025-03-20 03:24:02'),
(7, 'Vision nocturna', 'ya tu sabe', 2, 53, 53, 'Disponible', '2025-03-20 05:38:19', '2025-03-20 05:38:19'),
(8, 'hdmi vga', 'adada', 1, 5, 5, 'Disponible', '2025-03-20 17:31:18', '2025-03-20 18:10:51'),
(9, 'Pizzara movil', ' Pizarra de 32 pulgadas', 2, 54, 54, 'Disponible', '2025-03-20 18:09:19', '2025-03-20 18:09:19');

INSERT INTO solicitudes (id, usuario_id, item_id, fecha_solicitud, fecha_uso, hora_inicio, hora_fin, motivo, estado, comentarios, created_at, updated_at) VALUES
(2, 2, 2, '2025-03-20 17:26:34', '2025-03-21', '14:26:00', '15:52:00', ' lo quiero usar jeje', 'Finalizada', 'no lo tenemos disponible', '2025-03-20 17:26:34', '2025-03-20 17:30:02'),
(3, 2, 8, '2025-03-20 17:32:00', '2025-03-21', '13:31:00', '17:31:00', 'clases', 'Finalizada', NULL, '2025-03-20 17:32:00', '2025-03-20 18:10:51'),
(4, 4, 7, '2025-03-20 18:06:10', '2025-03-21', '14:00:00', '16:00:00', ' quiero usarlo para mi clase de derecho', 'Rechazada', NULL, '2025-03-20 18:06:10', '2025-03-20 18:07:39');
