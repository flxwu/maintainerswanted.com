import { h, Component } from 'preact';
import styled from 'styled-components';
import axios from 'axios';
import MediaQuery from 'react-responsive';

import ProjectCard from './components/project/ProjectCard';
import NewProject from './components/form/NewProject';
import Header from './components/Header';
import Loading from './components/Loading';

export default class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      projects: [],
      loggedIn: false,
      user: null
    };

    // accessibility: add outline if tab is used
    if (typeof window !== 'undefined') {
      const handleFirstTab = e => {
        if (e.keyCode === 9) {
          document.body.classList.add('user-is-tabbing');
          window.removeEventListener('keydown', handleFirstTab);
        }
      };

      window.addEventListener('keydown', handleFirstTab);
    }

    if (typeof document !== 'undefined') {
      document.title = 'Maintainers Wanted';
    }
  }

  async componentDidMount () {
    console.log(window.location);
    // get if logged in
    const authStatus = await axios.get('/api/auth/status');

    // get projects list
    const response = await axios.get('/api/project/getList');
    const dataObject = response.data.data;
    const data = dataObject !== 'None'
      ? Object.keys(dataObject).map(dbKey => dataObject[dbKey])
      : 'None';

    this.setState({
      projects: data,
      loggedIn: authStatus.data.loggedIn,
      user: authStatus.data.user
    });
  }

  render ({}, { projects, loggedIn, user }) { // eslint-disable-line no-empty-pattern
    return (
      <div>
        <Header loggedIn={loggedIn} user={user} />
        <MediaQuery minDeviceWidth={1224}>
          <List>
            <NewProject loggedIn={loggedIn} />
            {projects === 'None'
              ? <div>No Projects in DB</div>
              : projects.length !== 0 ? (
                projects.map(project => (
                  <ProjectCardWrapper>
                    <ProjectCard project={project} />
                  </ProjectCardWrapper>
                ))
              ) : (
                <Loading />
              )}
          </List>
        </MediaQuery>
        <MediaQuery maxDeviceWidth={1224}>
          <List mobile>
            <NewProject loggedIn={loggedIn} />
            {projects === 'None'
              ? <div>No Projects in DB</div>
              : projects.length !== 0 ? (
                projects.map(project => (
                  <ProjectCardWrapper>
                    <ProjectCard project={project} />
                  </ProjectCardWrapper>
                ))
              ) : (
                <Loading />
              )}
          </List>
        </MediaQuery>
        <FooterWrapper>
          <Footer>
            Made with love by
            <Link href='https://twitter.com/flxwu'> @flxwu</Link> and
            <Link href='https://twitter.com/QuentinOschatz'> @Qo2770</Link>
            <br />
            <Footer break>
              <Link break href='https://github.com/flxwu/maintainerswanted.com'>
                Find us on Github!
              </Link>
            </Footer>
            <br />
            <Footer small break>
              Built using
              <Link small href='https://github.com/flxwu/maintainerswanted.com'>
                {' Preact'}
              </Link>{' '}
              +
              <Link small href='https://github.com/flxwu/maintainerswanted.com'>
                {' Express'}
              </Link>{' '}
              +
              <Link small href='https://github.com/flxwu/maintainerswanted.com'>
                {' Firebase'}
              </Link>
            </Footer>
          </Footer>
        </FooterWrapper>
      </div>
    );
  }
}

const List = styled.ul`
  display: block;
  margin-block-start: 3em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  padding-inline-start: ${props => (props.mobile ? '10%' : '20%')};
  -webkit-padding-start: ${props => (props.mobile ? '10%' : '20%')};
  padding-inline-end: ${props => (props.mobile ? '10%' : '20%')};
  -webkit-padding-end: ${props => (props.mobile ? '10%' : '20%')};
  list-style-type: none;
  background: #fafafa;
  text-align: center;
`;

const FooterWrapper = styled.div`
  display: flex;
  justify-content: center;
  background: #fafafa;
  height: 20px;
  margin: 50px 0;
`;

const Footer = styled.div`
  position: relative;
  text-align: center;
  ${props => props.small && 'font-size: 12px'};
  ${props => props.break && 'margin: 10px 0'};
`;

const ProjectCardWrapper = styled.li`
  position: relative;
  flex: 1;
`;

const Link = styled.a`
  text-decoration: none;
  font-weight: bold;
  text-align: center;
  color: #e27d60;
  &:hover {
    color: grey;
  }
  ${props => props.break && 'margin-top: 10px'};
`;
