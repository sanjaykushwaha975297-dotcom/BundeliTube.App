import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: colors.amber.darken2,
        accent: colors.amber.accent2,
        secondary: colors.grey.darken3,
        info: colors.teal.lighten1,
        warning: colors.amber.base,
        error: colors.deepOrange.accent4,
        success: colors.green.accent3,
        background: '#0f172a',
      },
      light: {
        primary: colors.amber.darken3,
        accent: colors.amber.accent3,
        secondary: colors.grey.lighten3,
        background: '#f8fafc',
      },
    },
  },
});
