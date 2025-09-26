# Data Provider - The Children's World API

## 📋 Parámetros de API Correctos

### 🔧 Parámetros de Paginación

Tu API usa los siguientes parámetros para paginación:

| Parámetro | Descripción | Valor por Defecto | Ejemplo |
|-----------|-------------|-------------------|---------|
| `page` | Número de página (empezando en 1) | 1 | `page=1` |
| `take` | Cantidad de elementos por página | 10 | `take=20` |

**❌ Incorrecto:**
```
?page=1&limit=10
```

**✅ Correcto:**
```
?page=1&take=10
```

### 🔄 Parámetros de Ordenamiento

Tu API usa un solo parámetro para ordenamiento:

| Parámetro | Descripción | Valores Válidos | Ejemplo |
|-----------|-------------|-----------------|---------|
| `order` | Orden de los resultados | `ASC`, `DESC` | `order=DESC` |

**❌ Incorrecto:**
```
?sortBy=createdAt&sortOrder=desc
```

**✅ Correcto:**
```
?order=DESC
```

### 📊 Ejemplos de URLs Correctas

#### Lista de Usuarios
```
GET /api/users?page=1&take=10&order=DESC
```

#### Lista de Niños
```
GET /api/children?page=2&take=20&order=ASC
```

#### Lista de Asistencia
```
GET /api/attendance?page=1&take=15&order=DESC
```

### 🔍 Estructura de Respuesta

Tu API devuelve respuestas con esta estructura:

```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      // ... otros campos
    }
  ],
  "meta": {
    "page": 1,
    "take": 10,
    "totalCount": 25,
    "pageCount": 3,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

### 🛠️ Implementación en Data Provider

El data provider está configurado para usar los parámetros correctos:

```typescript
// Paginación
url.searchParams.append("page", String(pagination.current || 1));
url.searchParams.append("take", String(pagination.pageSize || 10));

// Ordenamiento
const order = sorter.order === "asc" ? "ASC" : "DESC";
url.searchParams.append("order", order);
```

### 🚨 Errores Comunes

#### Error 400: "property limit should not exist"
**Causa:** Usando `limit` en lugar de `take`
**Solución:** Cambiar `limit` por `take`

#### Error 400: "property sortBy should not exist"
**Causa:** Usando `sortBy` y `sortOrder` en lugar de `order`
**Solución:** Usar solo `order` con valores `ASC` o `DESC`

#### Error 400: "property sortOrder should not exist"
**Causa:** Usando `sortOrder` en lugar de `order`
**Solución:** Usar `order` con valores `ASC` o `DESC`

### 📝 Notas Importantes

1. **Paginación**: `page` empieza en 1, no en 0
2. **Límites**: `take` tiene un máximo de 150 elementos
3. **Ordenamiento**: Solo se puede ordenar por un campo a la vez
4. **Campos de ordenamiento**: No se especifica el campo, solo la dirección (ASC/DESC)

### 🔗 Referencias

- **PageOptionsDto**: `/src/dto/page-options.dto.ts`
- **Users Controller**: `/src/api/users/users.controller.ts`
- **Children Controller**: `/src/api/children/children.controller.ts`
