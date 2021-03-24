<template>
  <h1>
    <a href="https://github.com/Astray-git/vue-dragula">
      <img
        src="../resources/logo.svg"
        onerror="this.src='resources/logo.png'"
        alt="vue-dragula"
    /></a>
  </h1>
  <h3 class="tagline">Drag and drop so simple it hurts</h3>
  <a href="https://github.com/Astray-git/vue-dragula">
    <img
      class="gh-fork"
      src="https://camo.githubusercontent.com/52760788cde945287fbb584134c4cbc2bc36f904/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f77686974655f6666666666662e706e67"
      alt="Fork me on GitHub"
      data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_white_ffffff.png"
    />
  </a>
  <div class="parent">
    Note: these examples mimic the ones for <code>dragula</code>, but using
    <code>vue-dragula</code>.
  </div>
  <div class="examples" id="examples">
    <div class="parent">
      <label
        >Move stuff between these two containers. Note how the stuff gets
        inserted near the mouse pointer? Great stuff.</label
      >
      <div class="wrapper">
        <div class="container" v-dragula="colOne" bag="first-bag">
          <div v-for="(text, index) in colOne" :key="index" @click="onClick">
            {{ text }} [click me]
          </div>
        </div>
        <div class="container" v-dragula="colTwo" bag="first-bag">
          <div v-for="(text, index) in colTwo" :key="index">{{ text }}</div>
        </div>
      </div>
      <pre>
        <code>
          &lt;div v-dragula=&quot;colOne&quot; bag=&quot;first-bag&quot;&gt;&lt;/div&gt;
          &lt;div v-dragula=&quot;colTwo&quot; bag=&quot;first-bag&quot;&gt;&lt;/div&gt;
        </code>
      </pre>
      <h4>Result</h4>
      <div>
        <h5>colOne</h5>
        {{ colOne }}
      </div>

      <div>
        <h5>colTwo</h5>
        {{ colTwo }}
      </div>
    </div>
  </div>

  <div class="examples" id="examples-2">
    <div class="parent">
      <label>Modify items in dragula bag with transition</label>
      <div
        class="wrapper"
        v-for="(container, containerIndex) in categories"
        :key="containerIndex"
      >
        <div class="container" v-dragula="container" bag="second-bag">
          <div
            v-for="(number, index) in container"
            :key="index"
            transition="scale"
          >
            {{ number }}
          </div>
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
          <div v-for="(text, index) in copyOne" :key="index">{{ text }}</div>
        </div>
        <div class="container" v-dragula="copyTwo" bag="third-bag">
          <div v-for="(text, index) in copyTwo" :key="index">{{ text }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      colOne: [
        "You can move these elements between these two containers",
        'Moving them anywhere else isn"t quite possible',
        'There"s also the possibility of moving elements around in the same container, changing their position',
      ],
      colTwo: [
        "This is the default use case. You only need to specify the containers you want to use",
        "More interactive use cases lie ahead",
        "Another message",
      ],
      categories: [
        [1, 2, 3],
        [4, 5, 6],
      ],
      copyOne: [
        "Lorem ipsum dolor sit amet, consectetuer adipiscing elit.",
        "Aenean commodo ligula eget dolor. Aenean massa.",
      ],
      copyTwo: [
        "Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
        "Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.",
      ],
    };
  },
  created() {
    console.log(this.vueDragula);
    this.vueDragula.options("third-bag", {
      copy: true,
    });
  },
  mounted() {
    this.vueDragula.eventBus.on("drop", (args) => {
      console.log("drop: " + args[0]);
      console.log(this.categories);
    });
    this.vueDragula.eventBus.on("dropModel", (args) => {
      console.log("dropModel: " + args);
      console.log(this.categories);
    });
  },
  methods: {
    onClick() {
      console.log(this.vueDragula.find("first-bag"));
      window.alert("click event");
    },
    testModify() {
      this.categories = [
        ["a", "b", "c"],
        ["d", "e", "f"],
      ];
    },
  },
};
</script>
