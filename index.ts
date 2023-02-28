/// <reference path='redux.d.ts' />

function getxml() {
    const _url_xml = 'https://raw.githubusercontent.com/haanipublish/MyPublish/master/publish.xml'
    // fetch(_url_xml).then(res => res.text())
    //     .then(xmltext => {
    //         const parser = new DOMParser()
    //         let _xml = parser.parseFromString(xmltext, 'application/xml')
    //         store.dispatch({ type: 'XML_LOADED', xml: _xml })
    //     })
    //     .catch(console.error)

    $.ajax({
        url: _url_xml,
        success: xmltext => {
            const parser = new DOMParser()
            let _xml = parser.parseFromString(xmltext, 'application/xml')
            store.dispatch({ type: 'XML_LOADED', xml: _xml })
        },
        error: xhr => store.dispatch({ type: 'Error', error: xhr, errorText: xhr.responseText })
    })
    // .catch((xhr, error, string) => {
    //     console.log(xhr)
    //     console.log(error)
    //     console.log(string)
    // })
}

class myAppInfo {
    name: string | undefined
    id: string | undefined
    currentVersion: string | undefined
    files: versionFileInfo[] = []
    constructor(name: string | undefined, id: string | undefined, currentVersion: string | undefined) {
        this.name = name
        this.id = id
        this.currentVersion = currentVersion
    }
    get currentFile(): versionFileInfo | undefined {
        return this.files.find((file, index, obj) => {
            return file.version === this.currentVersion
        })
    }
}

function xmlTranslate(xml: Document | null): myAppInfo[] {
    if (xml == null) return []
    let apps: myAppInfo[] = []
    let elApps = xml.getElementsByTagName('App')
    for (const info of elApps) {
        let app = new myAppInfo(
            info.attributes.getNamedItem('Name')?.value,
            info.attributes.getNamedItem('Id')?.value,
            info.attributes.getNamedItem('CurrentVersion')?.value
        )
        for (const finfo of info.getElementsByTagName('File')) {
            app.files.push({
                version: finfo.attributes.getNamedItem('Version')?.value,
                path: finfo.attributes.getNamedItem('Path')?.value,
            })
        }
        app.files.sort()
        apps.push(app)
    }
    return apps
}

function showAppList() {
    let state: myState = store.getState()
    if (state.page != 'front') return

    let nav = `
    <nav><ul class='nav-menu'>
    <li><a href='https://haanipublish.github.io/MyPublish/'>Haani</a></li>
    <li><a href='https://dukson1224.github.io/mypublish/'>DukSon</a></li>
    </ul></nav>`

    let title = `${nav}<h1>Haani Publish</h1>`

    let apps: myAppInfo[] = state.apps
    let rows: string[] = []
    apps.forEach(info => {
        rows.push(`<tr>
        <td><a href="#!${info.name}" onclick="event.preventDefault(); store.dispatch({ type: 'APP_SELECTED', selectedAppId: '${info.id}' })">${info.name}</a></td>
        <td><a href="${info.currentFile?.path}">down</a></td>
        </tr>
        `)
    })
    let table = `<table>
    <caption>
    <h2>App list</h2>
    </caption>
    <tr>
            <th>Name</th>
        </tr>
        ${rows.join('')}
        </table>
        `
    $('#myHeading').html(title)
    $('#myContent').html(table)
}

function showAppDetail() {
    let state: myState = store.getState()
    if (state.page != 'detail') return
    let info: myAppInfo | undefined = state.apps.find(ai => ai.id == state.selectedAppId)
    if (!info) return

    let nav = `
    <nav><ul class='nav-menu'>
    <li><a href='https://haanipublish.github.io/MyPublish/'>Haani</a></li>
    <li><a href='https://dukson1224.github.io/mypublish/'>DukSon</a></li>
    </ul></nav>`

    let title = `${nav}<h1><a href="#!applist" class="backbutton" onclick="event.preventDefault(); store.dispatch({ type: 'APP_SELECTED', selectedAppId: undefined })">a</a></h1><h1>${info.name}</h1>`

    let rows: string[] = []
    info.files.forEach(fi => {
        rows.push(`<tr>
        <td style="text-align:center">${fi.version == info!.currentVersion ? '○' : ''}</td>
        <td>${fi.version}</td>
        <td><a href="${fi.path}">down</a></td>
        </tr>`)
    })
    let table = `<table>
    <tr>
    <th>Current</th>
    <th>Version</th>
    </tr>
    ${rows.join('')}
    </table>
    `
    // let heading = document.getElementById('myHeading') as HTMLDivElement
    // let content = document.getElementById('myContent') as HTMLDivElement
    // if (heading && content) {
    //     heading.innerHTML = title
    //     content.innerHTML = table
    // }
    $('#myHeading').html(title)
    $('#myContent').html(table)
}

function showError() {
    let state: myState = store.getState()
    if (state.page != 'error') return
    let error = `<h1>${state.errorText}</h1>`
    $('#myHeading').html(error)
    $('#myContent').html('')
}

function reducer(state: myState, action: any): myState {
    if (state == undefined) {
        getxml()
        return {
            apps: [], selectedAppId: undefined,
            error: undefined, errorText: '',
            page: 'front' // detail, error
        }
    }
    let newState: myState = Object.assign({}, state)
    switch (action.type) {
        case 'XML_LOADED':
            if (action.xml instanceof Document) {
                newState.apps = xmlTranslate(action.xml)
                if (newState.apps.length > 0) {
                    newState.page = 'front'
                } else {
                    newState.page = 'error'
                    newState.errorText = 'There is no application'
                }
            }
            break;
        case 'APP_SELECTED':
            newState.selectedAppId = action.selectedAppId
            newState.page = newState.selectedAppId ? 'detail' : 'front'
            break;
        case 'Error':
            newState.error = action.error
            newState.page = 'error'
            newState.errorText = action.errorText
            break;
        default:
            newState.error = action.error
            newState.page = 'error'
            newState.errorText = 'Unknown Error'
            break;
    }
    return newState
}

let store = Redux.createStore(reducer)
store.subscribe(showAppList)
store.subscribe(showAppDetail)
store.subscribe(showError)
