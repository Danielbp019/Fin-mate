import prettier from 'eslint-config-prettier';
import vuetify from 'eslint-config-vuetify';

const config = await vuetify({ ts: true });

export default [...config, prettier];
