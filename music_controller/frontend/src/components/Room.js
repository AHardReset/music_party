import React, {Component} from 'react';
import {Grid, Button, Typography, Card} from '@material-ui/core';
import CreateRoomPage from './CreateRoomPage';
import MusicPlayer from './MusicPlayer'

export default class Room extends Component {
    constructor (props) {
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,
            spotifyAuthenticated: false,
            song: {}
        };

        this.renderSettingsButton = this.renderSettingsButton.bind(this);
        this.roomCode = this.props.match.params.roomCode;
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
        this.updateShowSettings = this.updateShowSettings.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.getRoomDetails = this.getRoomDetails.bind(this);
        this.authenticateSpotify = this.authenticateSpotify.bind(this);
        this.getCurrentSong = this.getCurrentSong.bind(this);
        this.getRoomDetails();

    }

    componentDidMount(){
        this.interval = setInterval(this.getCurrentSong, 1000)
    }

    componentWillUnmount(){
        clearInterval(this.interval);
    }

    updateShowSettings(e){
        this.setState({
            showSettings: e,
        });
        
    }

    renderSettingsButton(){
        return(
            <Grid item xs={12} align="center">
                <Button variant='contained' color="primary" onClick={() =>
                this.updateShowSettings(true)
                }>
                    Settings
                </Button>
            </Grid>
        );
    }

    renderSettings(){
        return(
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <CreateRoomPage 
                    update={true} 
                    votesToSkip={this.state.votesToSkip} 
                    guestCanPause={this.state.guestCanPause} 
                    roomCode = {this.roomCode}
                    updateCallback={this.getRoomDetails}
                    />
                </Grid>

                <Grid item xs={12} align="center">
                    <Button variant="contained" color="primary" onClick={() => this.updateShowSettings(false)}>
                        Close settings
                    </Button>
                </Grid>
            </Grid>
        )
    }

    getRoomDetails() {
        return fetch("/api/get-room" + "?code=" + this.roomCode)
            .then((response) => {
            if (!response.ok) {
                this.props.leaveRoomCallback();
                this.props.history.push("/");
            }
            return response.json();
            })
            .then((data) => {
            this.setState({
                votesToSkip: data.votes_to_skip,
                guestCanPause: data.guest_can_pause,
                isHost: data.is_host,
            });
            if (this.state.isHost) {
                this.authenticateSpotify();
            };
            const headers = {
                method: 'POST',
                headers: new Headers({
                           'Content-Type': 'application/json', // <-- Specifying the Content-Type
                  }),
                body: JSON.stringify({update_room: true}) // <-- Post parameters
              }
            fetch("/spotify/skip", headers);
            });
        }

    authenticateSpotify() {
        fetch("/spotify/is-authenticated")
        .then((response) => response.json())
        .then((data) => {
        this.setState({ spotifyAuthenticated: data.status });
        console.log(data.status);
        if (!data.status) {
            fetch("/spotify/get-auth-url")
            .then((response) => response.json())
            .then((data) => {
                window.location.replace(data.url);
            });
        }
        });
    }

    leaveButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        };
        fetch("/api/leave-room", requestOptions).then((_response) => {
            this.props.leaveRoomCallback();
            this.props.history.push("/");
        });
    }

    getCurrentSong() {
        fetch("/spotify/current-song")
          .then((response) => {
            if (!response.ok) {
              return {};
            } else {
              return response.json();
            }
          })
          .then((data) => {
            this.setState({ song: data });
            console.log(data);
          });
      }

    render() {
        if(this.state.showSettings){
            return this.renderSettings();
        }
        return(
            <Grid container spacing={1} alignItems='center'>
                <Grid item xs={12} align="center">
                    <Card>
                        <Typography variant="h4" component="h4">
                            Code: {this.roomCode}
                        </Typography>
                    </Card> 
                </Grid>

                <Grid item xs={12} align="center">
                    <MusicPlayer {...this.state.song}/>
                </Grid>
                

                {this.state.isHost ? this.renderSettingsButton():null}

                <Grid item xs={12} align="center">
                    <Button variant="contained" color="secondary" onClick={this.leaveButtonPressed}>Leave Room</Button>
                </Grid>
            </Grid>
            
        );
    }
}

/*
            <div>
                <h3>{this.roomCode}</h3>
                <p>Guest Can Pause: { this.state.guestCanPause.toString() }</p>
                <p>Votes To Skip: {this.state.votesToSkip}</p>
                <p>Is the Host?: {this.state.isHost.toString()}</p>
            </div>
*/

/*
<Grid item xs={12} align="center">
    <Typography variant="h6" component="h6">
        Votes to skip: {this.state.votesToSkip}
    </Typography>
</Grid>

<Grid item xs={12} align="center">
    <Typography variant="h6" component="h6">
        Guest Can Pause: { this.state.guestCanPause.toString() }
    </Typography>
</Grid>

<Grid item xs={12} align="center">
    <Typography variant="h6" component="h6">
        Is the Host?: {this.state.isHost.toString()}
    </Typography>
</Grid>
*/