import Account from "@/pages/account/index.vue"
import AccountSettings from "@/pages/account/Settings.vue"
import AccountSecurity from "@/pages/account/Security.vue"
import AccountSecurityChangePassword from "@/pages/account/Security/ChangePassword.vue"
import AccountSecuritySessions from "@/pages/account/Security/Sessions.vue"
import AccountTeams from "@/pages/account/Teams.vue"
import AccessRequest from "@/pages/AccessRequest.vue"

import { CogIcon } from '@heroicons/vue/outline'
import store from '@/store'


export default [
    {
        path: '/account/request/:id',
        component: AccessRequest,
        beforeEnter: (to,_,next) => {
            let removeWatch;
            function proceed () {
                if (removeWatch) {
                    removeWatch();
                }
                if (store.state.account.user) {
                    window.location.href = `/account/complete/${to.params.id}`;
                }
            }
            // Check if we've loaded the current user yet
            if (!store.state.account.user) {
                // Setup a watch
                removeWatch = store.watch(
                    (state) => state.account.user,
                    (_) => { proceed() }
                )
            } else {
                proceed()
            }
        }
    },
    {
        profileLink: true,
        path: '/account',
        redirect: '/account/settings',
        name: 'User Settings',
        icon: CogIcon,
        component: Account,
        children: [
            { path: 'settings', component: AccountSettings },
            { path: 'teams', component: AccountTeams },
            { path: 'security', component: AccountSecurity, redirect: '/account/security/password', children: [
                { path: 'password', component: AccountSecurityChangePassword },
                { path: 'sessions', component: AccountSecuritySessions }
            ]}
        ],
    },


    {
        profileLink: true,
        path: '/account/logout',
        name: 'Sign out',
        redirect: function() {
            store.dispatch('account/logout');
            return { path: '/' }
        },
    },
]