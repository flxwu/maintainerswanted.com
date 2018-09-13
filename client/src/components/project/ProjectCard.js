import { h, Component } from 'preact';
import styled from 'styled-components';
import axios from 'axios';
import MediaQuery from 'react-responsive';
import Emoji from 'react-emoji-render';

import Icon from '../Icon';
import Info from './Info';

class ProjectCard extends Component {
  constructor (props) {
    super(props);
    this.state = {
      project: props.project,
      stars: 0,
      watchers: 0,
      contributors: 0,
      labels: []
    };
  }

  componentDidMount = async () => {
    const { project } = this.state;

    const url = `/api/project/getStatistics?owner=${project.owner}&repo=${
      project.repo
    }`;
    // Get stars and contributors for single project
    const response = await axios.get(url);
    const data = response.data.data;
    this.setState({
      stars: data.stars,
      watchers: data.watchers,
      contributors: data.contributors
    });
  };

  render ({ project }, { stars, contributors, labels }) {
    const { repo, description, url, twitter, issueNumber, topics } = project;

    const issueURL = `${url}/issues/${issueNumber}`;
    const twitterURL = handle => `https://twitter.com/${handle}`;

    // s. POST /add , gets added in DB as stringified array
    const topicsArray = topics
      .replace('[', '')
      .replace(']', '')
      .replace(/"/g, '')
      .split(',');

    return (
      <div>
        <MediaQuery minDeviceWidth={1224}>
          <Card>
            <Meta>
              <TitleWrapper>
                <Title>
                  <Link
                    href={issueURL}
                    target='_blank'
                    rel='noopener noreferrer'>
                    {repo}
                  </Link>
                </Title>
                <div style={styles.iconContainer}>
                  <a
                    href={twitterURL(twitter)}
                    target='_blank'
                    rel='noopener noreferrer'>
                    <Icon
                      type={'twitter'}
                      width={30}
                      height={30}
                      style={styles.twitter}
                    />
                  </a>
                  <a
                    style='margin-left: 7px'
                    href={url}
                    target='_blank'
                    rel='noopener noreferrer'>
                    <Icon
                      type={'github'}
                      width={30}
                      height={30}
                      style={styles.twitter}
                    />
                  </a>
                </div>
              </TitleWrapper>
              <Emoji text={description} />
              <Topics>
                {topicsArray === [] ? (
                  <div />
                ) : topicsArray.length !== 0 ? (
                  topicsArray
                    .slice(0, 5)
                    .map((topic, i) => <Topic>{topic}</Topic>)
                ) : (
                  <div />
                )}
              </Topics>
            </Meta>
            <Info stars={stars} contributors={contributors} />
          </Card>
        </MediaQuery>
        <MediaQuery maxDeviceWidth={1224}>
          <Card mobile>
            <Meta mobile>
              <Title mobile>
                <Link href={issueURL}>{repo}</Link>
              </Title>
              <Description text={description} />
              <Topics>
                {labels === [] ? (
                  <div />
                ) : labels.length !== 0 ? (
                  labels.slice(0, 5).map((label, i) => <Topic>{label}</Topic>)
                ) : (
                  <div />
                )}
              </Topics>
            </Meta>
            <Info stars={stars} contributors={contributors} />
            <div style={styles.iconContainerMobile}>
              <a
                href={twitterURL(twitter)}
                target='_blank'
                rel='noopener noreferrer'>
                <Icon
                  type={'twitter'}
                  width={20}
                  height={20}
                  style={styles.twitter}
                />
              </a>
              <a
                style='margin-left: 7px'
                href={url}
                target='_blank'
                rel='noopener noreferrer'>
                <Icon
                  type={'github'}
                  width={20}
                  height={20}
                  style={styles.twitter}
                />
              </a>
            </div>
          </Card>
        </MediaQuery>
      </div>
    );
  }
}

const styles = {
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    flexBasis: '100%',
    alignSelf: 'center',
    marginLeft: '15px'
  },
  iconContainerMobile: {
    display: 'flex',
    alignItems: 'center',
    flexBasis: '0',
    margin: '8px 0 10px 0'
  },
  twitter: {
    cursor: 'pointer',
    display: 'flex'
  }
};

const Card = styled.div`
  position: relative;
  background: #fff;
  padding: 4% 8%;
  border-radius: 12px;
  box-shadow: 0 0.4rem 0.8rem -0.1rem rgba(0,32,128,.1), 0 0 0 1px #f0f2f7;
  line-height: 1.8;
  margin-bottom: 20px;
  height: 10rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-around
  font-size: ${props => (props.mobile ? '12px' : '18px')};
  flex-direction: ${props => (props.mobile ? 'column' : 'row')};
  `;

const Meta = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  flex-basis: 70%;
  ${props => props.mobile && 'align-self: flex-start'};
  text-align: left;
`;

const TitleWrapper = styled.div`
  display: flex;
`;

const Title = styled.h2`
  display: flex;
  flex: 1;
  text-decoration: underline;
  font-family: Courier New;
  ${props => props.mobile && 'max-height: fit-content'};
  ${props => props.mobile && 'flex-basis: 0'};
`;

const Description = styled(Emoji)`
  display: flex;
`;

const Link = styled.a`
  display: flex;
  color: #e27d60;
  white-space: nowrap;
  flex: 1;
  &:hover {
    color: grey;
  }
`;

const Topics = styled.div`
  display: flex;
  color: #e27d60;
  text-align: center;
  width: 100%;
`;

const Topic = styled.p`
  box-shadow: 0 0.2rem 0.5rem -0.5rem rgba(0, 32, 128, 0.1), 0 0 0 1px #f0f2f7;
  padding: 5px;
  font-size: 1rem;
  margin: 4px;
  padding-top: 0px;
  padding-bottom: 0px;
  margin-top: 10px;
  margin-bottom: 0;
  border-radius: 5px;
  height: fit-content;
`;

export default ProjectCard;
