/**
 * Stub Container driver
 *
 * Handles the creation and deletation of containers to back Projects
 *
 * This Stub driver doesn't start any containers, just keeps state in memory
 *
 * @module stub
 * @memberof forge.containers.drivers
 *
 */
const list = {}

module.exports = {
    /**
     * Initialises this driver
     *
     * Use app.db.models.Project.findAll() to get a list of all projects
     * and do the work to synchronise the internal state with that list
     *
     * @param {string} app - the Vue application
     * @param {object} options - A set of configuration options for the driver
     * @return {forge.containers.ProjectArguments}
     */
    init: async (app, options) => {
        this._options = options
        this._app = app

        const projects = await this._app.db.models.Project.findAll()
        projects.forEach(project => {
            const p = {
                id: project.id,
                state: 'running',
                url: project.url,
                options: {},
                meta: { foo: 'bar' }
            }
            list[project.id] = p
        })

        // Should init return an object with details of config options per project?
        return {
            stack: {
                properties: {
                    nodered: {
                        label: 'Node-RED Version',
                        validate: '^(0|[1-9]\\d*)(\\.(0|[1-9]\\d*|x|\\*)(\\.(0|[1-9]\\d*|x|\\*))?)?$',
                        invalidMessage: 'Invalid version number - expected x.y.z'
                    }
                }
            }
        }
    },
    /**
     * Create a new Project
     *
     * If the driver has any driver-specific settings for the project, then
     * it can use the following to store them in the app database:
     *
     * Single property
     *   await project.updateSetting("pid",123)
     *
     * Bulk update
     *   await project.updateSettings({
     *     pid: pid,
     *     path: directory,
     *     port: port,
     *   })
     *
     * This *must* generate a clean set of auth tokens to pass to the launcher.
     * Calling this function will replace any existing tokens with a new set -
     * there can only be one active launcher per project.
     *
     *   const authTokens = await project.refreshAuthTokens();
     *
     * Once created, this *must* set the `url` property of the project:
     *
     *   project.url = "http://localhost:" + port;
     *   await project.save()
     *
     *
     * @param {Project} project - the project model instance
     * @param {forge.containers.Options} options - options for the project
     * @return {forge.containers.Project}
     */
    create: async (project, options) => {
        console.log('creating ', project.id)
        if (!list[project.id]) {
            list[project.id] = {
                id: project.id,
                state: 'running',
                url: `http://${project.name}.${this._options.domain}`,
                meta: { foo: 'bar' },
                options: options
            }
            return list[project.id]
        } else {
            throw new Error({ error: 'Name already exists' })
        }
    },
    /**
     * Removes a Project
     * @param {Project} project - the project model instance
     * @return {Object}
     */
    remove: async (project) => {
        console.log('removing ', project.id)
        if (list[project.id]) {
            delete list[project.id]
            return { status: 'okay' }
        } else {
            throw new Error({ error: project.id + ' not found' })
        }
    },
    /**
     * Retrieves details of a project's container
     * @param {Project} project - the project model instance
     * @return {Object}
     */
    details: async (project) => {
        return list[project.id]
    },
    /**
     * Returns an object holding the values to plug into a Projects `settings.js`
     * file by the nr-launcher
     *
     * @param {Project} project - the project model instance
     * @return {Object}
     */
    settings: async (project) => {
        const settings = {
            env: {}
        }
        return settings
    },
    /**
     * Lists the running projects
     * @param {String} filter
     * @return {Object}
     */
    list: async (filter) => {
        return list
    },
    /**
     * Starts a Project's container
     * @param {Project} project - the project model instance
     * @return {forge.Status}
     */
    start: async (project) => {
        if (list[project.id]) {
            list[project.id].state = 'running'
            return { status: 'okay' }
        } else {
            return { error: 'container not found' }
        }
    },
    /**
     * Stops a Proejct's container
     * @param {Project} project - the project model instance
     * @return {forge.Status}
     */
    stop: async (project) => {
        if (list[project.id]) {
            list[project.id].state = 'stopped'
            return { status: 'okay' }
        } else {
            return { error: 'container not found' }
        }
    },
    /**
     * Restarts a Project's container
     * @param {Project} project - the project model instance
     * @return {forge.Status}
     */
    restart: async (project) => {
        const rep = await this._app.containers.stop(project)
        if (rep.status && rep.status === 'okay') {
            return await this._app.containers.start(project)
        } else {
            return rep
        }
    },

    /**
     * Get a Project's logs
     * @param {Project} project - the project model instance
     * @return {array} logs
     */
    logs: async (project) => {
        return []
    },
    /**
     * Shutdown Driver
     */
    shutdown: async () => {

    }
}
