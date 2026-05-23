# Fin Mate - Finanzas Personales

Administrador de finanzas personales, ingresos y gastos, con modo de finanzas de pareja y consejos para administrar deudas y tratarlas.

## Project setup

```bash
$ npm install
```

Crear JWT_SECRET con el comando y pegar el resultado:

```bash
$ node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
migraciones y seeds:

npm run db:generate	Genera migraciones desde el schema
npm run db:migrate	Aplica migraciones a MariaDB
npm run db:seed	Inserta los 2 usuarios de prueba