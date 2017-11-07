import React from 'react'
import { Link } from 'react-router-dom'
import Post from '../components/Post'
import { gql, graphql } from 'react-apollo'
import InfiniteScroll from 'react-infinite-scroller'

class ListPage extends React.Component {

  componentWillReceiveProps(nextProps) {
    if (this.props.location.key !== nextProps.location.key) {
      this.props.data.refetch()
    }
  }

  render() {
    let props = this.props;
  //  let allPosts = this.props.data.allPosts;


    if (this.props.data.loading) {
      return (
        <div className='flex w-100 h-100 items-center justify-center pt7'>
          <div>
            Loading
            (from {process.env.REACT_APP_GRAPHQL_ENDPOINT})
          </div>
        </div>
      )
    }

    let blurClass = ''

    if (this.props.location.pathname !== '/') {
      blurClass = ' blur'
    }
    console.log(props);

    return (
      <div className={'w-100 flex justify-center pa6' + blurClass}>
        <div className='w-100 flex flex-wrap' style={{maxWidth: 1150}}>
          <Link
            to='/create'
            className='ma3 box new-post br2 flex flex-column items-center justify-center ttu fw6 f20 black-30 no-underline'
          >
            <img
              src={require('../assets/plus.svg')}
              alt=''
              className='plus mb3'
            />
            <div>New Post</div>
          </Link>
          <InfiniteScroll
            className=''
            pageStart={0}
            loadMore={() => props.loadMorePosts()}
            hasMore={props.hasMore}
            loader={<div>
                    <div className="loader">Loading ...</div>
                    </div>}
            >
            {this.props.data.allPosts.map(post => (
              <Post
                key={post.id}
                post={post}
              />
            ))}
        </InfiniteScroll>

        </div>
        {this.props.children}
      </div>
    )
  }
}

const FeedQuery = gql`query allPosts($first: Int!, $skip: Int!) {
  allPosts(orderBy: createdAt_DESC, first: $first, skip: $skip) {
    id
    imageUrl
    description
  }
  mata: _allPostsMeta {
    count
  }
}`

const ListPageWithData = graphql(FeedQuery, {
  options(props) {
  return {
    variables: {
      skip: 0,
      first: 2
    },
    fetchPolicy: 'network-only'
    };
  },
  props: ({ ownProps, data, meta = {}, variables }) => ({
      data,
      hasMore: meta.count === undefined || meta.count > data.allPosts.length,
      loadMorePosts: () => {
        data.fetchMore({
          variables: {
           skip: data.allPosts.length
         },
          updateQuery: (prevState, {fetchMoreResult}) => {
            if (!fetchMoreResult) return prevState;

            return {
              ...prevState,
              allPosts: [...prevState.allPosts, ...fetchMoreResult.allPosts]
            };
          }
        });
      }
    }),
})(ListPage)

export default ListPageWithData
