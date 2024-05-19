import React, { Component } from 'react';

import Loading from '../common/Loading/Loading.js'

class Logout extends Component {
    componentWillMount() {
        const { logout } = this.props.route;
        if (typeof(logout) === 'function')
        logout()
        
        let path = '/';
        this.props.router.push({
            pathname : path,
        })
    }
    render() {        
        return <Loading />
    }
}

export default Logout
