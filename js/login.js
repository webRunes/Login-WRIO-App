define(['react', 'moment'], function(React, moment) {

  var
    Details = React.createClass({displayName: "Details",
      getInitialState: function() {
        var props = this.props;
        return {
          img: props.importUrl + props.theme + '/img/no-photo-200x200.png',
          registered: moment(Date.now()).format('DD MMM YYYY')
        };
      },
      render: function() {
        return (
          React.createElement("div", {className: "col-xs-12 col-md-6 pull-right"}, 
              React.createElement("span", {itemscope: true, itemtype: "http://schema.org/ImageObject"}, 
                  React.createElement("img", {itemprop: "thumbnail", src: this.state.img, className: "pull-left"})
              ), 
              React.createElement("ul", {className: "details"}, 
                  React.createElement("li", null, "Registered: ", this.state.registered), 
                  React.createElement("li", null, "Rating: ", this.state.rating), 
                  React.createElement("li", null, "Followers: ", this.state.followers), 
                  React.createElement("li", null, "Posts: ", this.state.posts)
              )
          )
        );
      }
    }),
    Login = React.createClass({displayName: "Login",
      getInitialState: function() {
        return {
          title: {
            text: "Logged as I'm Anonymous ",
            label: 'WRIO',
            link: {
                url: "http://webrunes.com/",
                text: "Мой профиль"
            }

          },
          upgrade: {
            text: 'Upgrade guest account for free',
            label: '30 days left'

          },
          have: {
            text: 'Already have an account?'
          },
          twitter: {
            url: "http://login.webrunes.com/auth/twitter",
            img: 'http://www.foodini.co/assets/sign-in-with-twitter-icon-4ab300ee57991db4bd4b4517c5b8e9ed.jpg'
          },
          description: 'Информация публичного профайла доступна любому, даже незарегистрированным пользователям. Если вы хотите оставаться анонимным, просто не заполняйте его.'
        };
      },
        componentDidMount: function () {
            var that = this;
            window.addEventListener('message', function (e) {
                var message = e.data;
                if (e.origin == "http://storage.webrunes.com") {
                    console.log("Got message storage", message);
                    var jsmsg = JSON.parse(message);
                    that.setState({
                        upgrade: {
                            text: "Upgrade guest account for free",
                            label: jsmsg.days + 'days left'

                        },
                        title:{
                            text: "Logged as I'm Anonymous ",
                            label: 'WRIO',
                            link: {
                                url: jsmsg.url,
                                text: "Мой профиль"
                            }

                        }
                    });
                }
                if (e.origin == "http://login.webrunes.com") {
                    console.log("Got message login", message);
                    var jsmsg = JSON.parse(message);
                    if (jsmsg.login == "success") {
                        location.reload();
                    }
                }


            });
        },
      render: function() {
        var props = this.props;
        return (
          React.createElement("ul", {className: "info nav nav-pills nav-stacked", id: "profile-accordion"}, 
              React.createElement("li", {className: "panel"}, 
                  React.createElement("a", {href: "#profile-element", "data-parent": "#profile-accordion", "data-toggle": "collapse"}, 
                    React.createElement("span", {className: "glyphicon glyphicon-chevron-down pull-right"}), this.state.title.text, React.createElement("sup", null, this.state.title.label)
                  ), 
                  React.createElement("div", {className: "in", id: "profile-element"}, 
                      React.createElement("div", {className: "media thumbnail clearfix"}, 
                          React.createElement(Details, {importUrl: props.importUrl, theme: props.theme}), 
                          React.createElement("div", {className: "col-xs-12 col-md-6"}, 
                              React.createElement("p", null, this.state.description), 
                              React.createElement("a", {href: this.state.title.link.url}, this.state.title.link.text), 
                              React.createElement("ul", {className: "actions"}, 
                                  React.createElement("li", null, 
                                    React.createElement("iframe", {id: "storageiframe", src: "http://storage.webrunes.com"}), 
                                    React.createElement("a", {href: "wrio-account-edit.htm"}, React.createElement("span", {className: "glyphicon glyphicon-arrow-up"}), this.state.upgrade.text), " ", React.createElement("span", {className: "label label-warning"}, this.state.upgrade.label)
                                  )
                              ), 
                              React.createElement("ul", {className: "actions"}, 
                                  React.createElement("li", null, 
                                    React.createElement("a", {href: "#"}, React.createElement("span", {className: "glyphicon glyphicon-user"}), this.state.have.text)
                                  )
                              ), 
                              React.createElement("iframe", {id: "loginbuttoniframe", src: "http://login.webrunes.com/buttons/twitter", width: "230", height: "43", frameBorder: "no", scrolling: "no"})

                          )
                      )
                  )
              )
          )
        );
      }
    });

  return Login;
});
