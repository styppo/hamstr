<template>
  <div class="trends">
    <div class="trends-wrapper">
      <div class="trends-header">
        <h3>Trends</h3>
      </div>
      <div
        v-if="trends"
        class="trends-body"
      >
        <TrendsItem
          v-for="(trend, i) in sortedTrends"
          :key="i"
          :data="trend"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TrendsItem from '@/components/Trends/Item'
import { getTrends } from '@/services/api'

export default {
  name: 'Trends',
  components:{
    TrendsItem,
  },
  data(){
    return{
      trends: []
    }
  },
  computed: {
    sortedTrends(){
      const trendsArray = this.trends;
      trendsArray.sort((a,b) => a.tweetsCount > b.tweetsCount ? -1 : 1, 0)
      return trendsArray
    }
  },
  async mounted(){
    try{
      const response = await getTrends();
      const trends = response.data.trends;
      this.trends = trends;
    } catch(err){
      this.$notification({
        type: 'error',
        message: 'Error when fetching trends'
      })
    }
  },
}
</script>

<style lang="scss">
@import '@/assets/theme/colors.scss';
.trends{
  background-color: rgba($color: $color-dark-gray, $alpha: 0.1);
  border-radius: 1rem;
  &-wrapper{
  }
  &-header{
    padding: 1rem;
    h3{
      margin: 0;
      font-size: 1.5rem;
      color: #fff;
    }
  }
  &-body{

  }
}
</style>