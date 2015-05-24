define(['react', 'moment'], function(React, moment) {

  var
    Details = React.createClass({
      getInitialState: function() {
        var props = this.props;
        return {
          img: props.importUrl + props.theme + '/img/no-photo-200x200.png',
          registered: moment(Date.now()).format('DD MMM YYYY')
        };
      },
      render: function() {
        return (
          <div className='col-xs-12 col-md-6 pull-right'>
              <span itemscope itemtype="http://schema.org/ImageObject">
                  <img itemprop="thumbnail" src={this.state.img} className="pull-left" />
              </span>
              <ul className="details">
                  <li>Registered: {this.state.registered}</li>
                  <li>Rating: {this.state.rating}</li>
                  <li>Followers: {this.state.followers}</li>
                  <li>Posts: {this.state.posts}</li>
              </ul>
          </div>
        );
      }
    }),
    Login = React.createClass({
      getInitialState: function() {
        return {
          title: {
            text: "Logged as I'm Anonymous ",
            label: 'WRIO',
            url: "http://webrunes.com/"
          },
          upgrade: {
            text: 'Upgrade guest account for free',
            label: '30 days left'

          },
          have: {
            text: 'Already have an account?'
          },
          twitter: {
            url: "http://login.wr.io/auth/twitter",
            img: 'http://www.foodini.co/assets/sign-in-with-twitter-icon-4ab300ee57991db4bd4b4517c5b8e9ed.jpg'
          },
          description: 'Информация публичного профайла доступна любому, даже незарегистрированным пользователям. Если вы хотите оставаться анонимным, просто не заполняйте его.'
        };
      },
        componentDidMount: function () {
            var that = this;
            window.addEventListener('message', function (e) {
                var message = e.data;
                if (e.origin != "http://storage.webrunes.com") {
                    console.log("Skipping");
                    return;
                }
                console.log("Got message from iframe", message);
                var jsmsg = JSON.parse(message);
                that.setState({
                    upgrade: {
                        text: "Upgrade guest account for free",
                        label: jsmsg.days + 'days left'

                    },
                    title:{
                        text: "Logged as I'm Anonymous ",
                        label: 'WRIO',
                        url: jsmsg.url
                    }
                });

            });
        },
      render: function() {
        var props = this.props;
        return (
          <ul className="info nav nav-pills nav-stacked" id="profile-accordion">
              <li className="panel">
                  <a href="#profile-element" data-parent="#profile-accordion" data-toggle="collapse">
                    <span className="glyphicon glyphicon-chevron-down pull-right"></span>{this.state.title.text}<sup>{this.state.title.label}</sup>
                  </a>
                  <div className="in" id="profile-element">
                      <div className="media thumbnail clearfix">
                          <Details importUrl={props.importUrl} theme={props.theme} />
                          <div className="col-xs-12 col-md-6">
                              <p>{this.state.description}</p>
                              <a href={this.state.title.url}>Мой профиль</a>
                              <ul className="actions">
                                  <li>
                                    <iframe id="storageiframe" src="http://storage.webrunes.com"></iframe>
                                    <a href="wrio-account-edit.htm"><span className="glyphicon glyphicon-arrow-up"></span>{this.state.upgrade.text}</a> <span className="label label-warning">{this.state.upgrade.label}</span>
                                  </li>
                              </ul>
                              <ul className="actions">
                                  <li>
                                    <a href="#"><span className="glyphicon glyphicon-user"></span>{this.state.have.text}</a>
                                  </li>
                              </ul>
                              <a href={this.state.twitter.url}>
                                <img src={this.state.twitter.img} width="150" height="30" className="twitter" />
                              </a>
                          </div>
                      </div>
                  </div>
              </li>
          </ul>
        );
      }
    });

  return Login;
});
