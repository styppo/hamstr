<template>
  <div class="trends-item">
    <h3>{{ data.name }}</h3>
    <span>{{ normalizedTweetCount }} Tweets</span>
  </div>
</template>

<script>
export default {
  name: 'TrendsItem',
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    normalizedTweetCount(){
      const stringNumber = this.data.tweetsCount.toString();
      if(stringNumber.length > 4){
        return stringNumber.substring(0, stringNumber.length - 3) + "K"
      }
      return stringNumber
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/theme/colors.scss';
.trends-item{
  padding: 1rem;
  border-top: $border-dark;
  h3{
    margin: 0;
    color: #fff;
  }
  span{
    color: $color-dark-gray;
  }
}
</style>