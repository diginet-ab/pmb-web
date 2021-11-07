import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK, AUTH_GET_PERMISSIONS } from 'react-admin';
import { _adsClients } from './AdsDataProvider';
import { globalSession } from './PlcControl';

export default async (type: any, params: { username: string, password: string, status: number }) => {
    if (type === AUTH_LOGIN) {
        const { username, password } = params;
        let ok = false
        let plcUserName = "sfsdfsdf"
        let plcPassword = ""
        let permissions: number = 0
        try {
            for (let n = 0; n < 25; n++) {
                plcUserName = await _adsClients.adsDataProvider.readValue(`GlobalSettings.Users[${n}].Email`, globalSession) as string
                plcPassword = await _adsClients.adsDataProvider.readValue(`GlobalSettings.Users[${n}].Password`, globalSession) as string
                let permissionString = await _adsClients.adsDataProvider.readValue(`GlobalSettings.Users[${n}].Permissions`, globalSession) as string
                switch (permissionString) {
                    case 'User':
                        permissions = 0
                        break
                    case 'AdminUser':
                        permissions = 1
                        break
                    case 'SuperUser':
                        permissions = 2
                        break
                }
                ok = plcUserName.toUpperCase() === username.toUpperCase() && plcPassword === password
                if (ok)
                    break
            }
        } catch {
        }
        if (ok) {
            sessionStorage.setItem('userName', plcUserName);
            sessionStorage.setItem('auth', permissions.toString());
            return Promise.resolve(permissions);
        } else {
            return Promise.reject();
        }
    }
    // called when the user clicks on the logout button
    if (type === AUTH_LOGOUT) {
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('auth');
        return Promise.resolve();
    }
    // called when the API returns an error
    if (type === AUTH_ERROR) {
        const { status } = params;
        if (status === 401 || status === 403) {
            sessionStorage.removeItem('userName');
            sessionStorage.removeItem('auth');
            return Promise.reject();
        }
        return Promise.resolve();
    }
    // called when the user navigates to a new location
    if (type === AUTH_CHECK) {
        return sessionStorage.getItem('userName')
            ? Promise.resolve()
            : Promise.reject();
    }
    if (type === AUTH_GET_PERMISSIONS) {
        return sessionStorage.getItem('auth')
            ? Promise.resolve(parseInt(sessionStorage.getItem('auth')!))
            : Promise.reject();
    }
    return Promise.reject('Unknown method');
}
