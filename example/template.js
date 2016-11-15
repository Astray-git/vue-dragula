module.exports = `  <h1>
    <a href="https://github.com/Astray-git/vue-dragula">
    <img src="../resources/logo.svg" onerror="this.src='resources/logo.png'" alt="vue-dragula"/></a>
  </h1>
  <h3 class="tagline">Drag and drop so simple it hurts</h3>
  <a href="https://github.com/Astray-git/vue-dragula">
    <img class="gh-fork"
    src="https://camo.githubusercontent.com/52760788cde945287fbb584134c4cbc2bc36f904/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f77686974655f6666666666662e706e67"
    alt="Fork me on GitHub"
    data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_white_ffffff.png" />
  </a>
  <div class="parent">Note: these examples mimic the ones for <code>dragula</code>, but using <code>vue-dragula</code>.</div>
  <div class="examples" id="examples">
    <div class="parent">
      <label>Move stuff between these two containers. Note how the stuff gets inserted near the mouse pointer? Great stuff.</label>
      <div class="wrapper">
        <div class="container" v-dragula="colOne" bag="first-bag">
          <div v-for="text in colOne" @click="onClick">{{text}} [click me]</div>
        </div>
        <div class="container" v-dragula="colTwo" bag="first-bag">
          <div v-for="text in colTwo">{{text}}</div>
        </div>
      </div>
      <pre>
        <code>
          &lt;div v-dragula=&quot;colOne&quot; bag=&quot;first-bag&quot;&gt;&lt;/div&gt;
          &lt;div v-dragula=&quot;colTwo&quot; bag=&quot;first-bag&quot;&gt;&lt;/div&gt;
        </code>
      </pre>
      <h4>Result</h5>
      <p>
        <h5>colOne</h5>
        {{colOne | json}}
      </p>

      <p>
        <h5>colTwo</h5>
        {{colTwo | json}}
      </p>
    </div>
  </div>

  <div class="examples" id="examples-2">
    <div class="parent">
      <label>Modify items in dragula bag  with transition</label>
      <div class="wrapper" v-for="container in categories">
        <div class="container" v-dragula="container" bag="second-bag">
          <div v-for="number in container" transition="scale">{{number}}</div>
        </div>
      </div>
      <button @click="testModify">Modify Items</button>
    </div>
  </div>

  <div class="examples" id="examples-3">
    <div class="parent">
      <label>Copy between containers</label>
      <div class="wrapper">
        <div class="container" v-dragula="copyOne" bag="third-bag">
          <div v-for="text in copyOne" track-by="$index">{{text}}</div>
        </div>
        <div class="container" v-dragula="copyTwo" bag="third-bag">
          <div v-for="text in copyTwo" track-by="$index">{{text}}</div>
        </div>
      </div>
    </div>
  </div>`