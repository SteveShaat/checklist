/**
 * @author Alex Gibson
 * @name Checklist
 * @desc Checklist is an easy to use web app for creating quick to-do or shopping lists.
 *//*global $, Backbone, _, Store, Tap, console */$(function(){var a,b,c,d,e,f,g,h,i,j,k,l;a=Backbone.Model.extend({defaults:function(){return{text:"empty item",order:i.nextOrder(),done:!1}},validate:function(a){if(!_.isString(a.text))return"Text attribute must be a string";if(!_.isBoolean(a.done))return"Done attribute must be a boolean";if(!_.isNumber(a.order))return"Order attribute must be a number"},initialize:function(){this.get("title")||this.set({title:this.defaults.title});this.bind("error",function(a,b){console.error(b)})},toggle:function(){this.save({done:!this.get("done")})},clear:function(){this.destroy()}});b=Backbone.Collection.extend({model:a,localStorage:new Store("items"),done:function(){return this.filter(function(a){return a.get("done")})},remaining:function(){return this.without.apply(this,this.done())},nextOrder:function(){return this.length?this.last().get("order")+1:1}});c=Backbone.Router.extend({routes:{"":"defaultRoute",settings:"settings","add/:id":"add","edit/:id":"edit"},initialize:function(a){this.collection=a.collection;this.appView=a.appView},settings:function(){var a=new f({collection:this.collection});this.appView.showView(a);this.collection.fetch();a.trigger("rendered")},add:function(a){var b=new h({collection:this.collection});this.appView.showView(b);this.collection.fetch();$("#new-item-name").val(decodeURIComponent(a.replace(/\+/g," ")))},edit:function(a){var b,c;this.collection.fetch();b=this.collection.get(a);if(b!==undefined){c=new g({model:b});this.appView.showView(c);c.trigger("rendered")}else k.navigate("",{trigger:!0})},defaultRoute:function(){var a=new h({collection:this.collection});this.appView.showView(a);this.collection.fetch()}});d=Backbone.View.extend({showView:function(a){this.currentView&&this.currentView.destroy();this.currentView=a;this.currentView.render();$("#app-view").html(this.currentView.el)}});e=Backbone.View.extend({tagName:"li",template:_.template($("#item-template").html()),events:{"click .check":"toggleDone","tap .item-text":"toggleDone","tap .edit":"editItem","keypress .edit":"editOnEnter"},initialize:function(){this.model.bind("change",this.render,this);this.model.bind("destroy",this.remove,this)},render:function(){$(this.el).html(this.template(this.model.toJSON()));this.setText();return this},setText:function(){var a=this.model.escape("text");this.$(".item-text").html(a)},toggleDone:function(){this.model.toggle()},editItem:function(){k.navigate("edit/"+this.model.get("id"),{trigger:!0})},editOnEnter:function(a){if(a.keyCode!==13)return;k.navigate("edit/"+this.model.get("id"),{trigger:!0})},remove:function(){$(this.el).unbind();$(this.el).remove()},clear:function(){this.model.clear()}});f=Backbone.View.extend({tagName:"section",settingsTemplate:_.template($("#settings-template").html()),events:{"click #clear-completed":"clearCompleted","click #clear-all":"clearAll","click #uncheck-all":"uncheckAll","tap #close-settings":"closeSettings","keypress #close-settings":"closeOnEnter"},initialize:function(a){this.bind("rendered",this.afterRender,this);this.collection=a.collection;this.clearCompletedFlag=!1;this.uncheckAllFlag=!1;this.clearAllFlag=!1},render:function(){$(this.el).html(this.settingsTemplate());return this},afterRender:function(){this.updateEmailLink()},clearCompleted:function(){this.clearCompletedFlag=!this.clearCompletedFlag},clearAll:function(){this.clearAllFlag=!this.clearAllFlag},uncheckAll:function(){this.uncheckAllFlag=!this.uncheckAllFlag},updateEmailLink:function(){var a="mailto:?",b="My list",c="";_.each(this.collection.models,function(a){c+=a.get("text")+"\n"});a+="subject="+encodeURIComponent(b);a+="&body="+encodeURIComponent(c);a+=encodeURIComponent("\n\nCreate your own list at: http://alexgibson.github.com/checklist/\n");$("#maillink").attr("href",a);return!1},updateCollection:function(){this.clearCompletedFlag&&_.each(this.collection.done(),function(a){a.clear()});this.uncheckAllFlag&&_.each(this.collection.done(),function(a){a.save({done:!1})});if(this.clearAllFlag)while(this.collection.models.length>0)this.collection.models[0].destroy();k.navigate("",{trigger:!0})},closeSettings:function(){this.updateCollection()},closeOnEnter:function(a){if(a.keyCode!==13)return;this.updateCollection()},destroy:function(){this.unbind();this.remove()}});g=Backbone.View.extend({tagName:"section",editTemplate:_.template($("#edit-template").html()),events:{"tap #save-edit":"saveItem","click #clear":"clearItem","keypress #edit-field":"saveOnEnter","keypress #save-edit":"saveOnEnter","click #edit-completed":"toggleDone"},initialize:function(a){this.model=a.model;this.bind("rendered",this.afterRender,this);this.clear=!1},render:function(){$(this.el).html(this.editTemplate(this.model.toJSON()));return this},afterRender:function(){this.updateShareLink()},saveItem:function(){if(this.input==="")return;if(this.clear)this.model.destroy();else{this.input=$("#edit-field").val();this.model.save({text:this.input})}k.navigate("",{trigger:!0})},saveOnEnter:function(a){var b=$("#edit-field").val();if(!b||a.keyCode!==13)return;a.preventDefault();this.saveItem()},toggleDone:function(){this.model.toggle()},clearItem:function(){this.clear=!this.clear},updateShareLink:function(){var a="mailto:?",b="New item for your checklist",c=this.model.get("text");a+="subject="+encodeURIComponent(b);a+="&body=http://alexgibson.github.com/checklist/#add/"+encodeURIComponent(c.replace(/\ /g,"+"));$("#share-item-link").attr("href",a);return!1},destroy:function(){this.unbind();this.remove()}});h=Backbone.View.extend({tagName:"section",statsTemplate:_.template($("#totals-template").html()),emptyListTemplate:_.template($("#empty-list-template").html()),listTemplate:_.template($("#list-template").html()),settingsTemplate:_.template($("#settings-bar-template").html()),events:{"keypress #new-item-name":"createOnEnter","tap #add-button":"createOnSubmit","tap .settings":"openSettings","keypress .settings":"settingsOnEnter"},initialize:function(a){this.collection=a.collection;this.collection.bind("add",this.addOne,this);this.collection.bind("reset",this.addAll,this);this.collection.bind("all",this.render,this)},render:function(){var a=this.collection.length;this.$("#todo-stats").html(this.statsTemplate({total:a,done:this.collection.done().length,remaining:this.collection.remaining().length}));this.$("#empty-list").html(this.emptyListTemplate({total:a}));this.$("#settings-bar").html(this.settingsTemplate({total:a}));document.title="Checklist ("+this.collection.remaining().length+")";return this},addOne:function(a){var b=new e({model:a});$("#todo-list").append(b.render().el)},addAll:function(){$(this.el).html(this.listTemplate());this.collection.each(this.addOne)},createOnEnter:function(a){var b=$("#new-item-name"),c=b.val();if(!c||a.keyCode!==13)return;a.preventDefault();this.collection.create({text:c});b.val("").blur()},createOnSubmit:function(a){var b=$("#new-item-name"),c=b.val();if(!c)return;a.preventDefault();this.collection.create({text:c});b.val("")},openSettings:function(){k.navigate("settings",{trigger:!0})},settingsOnEnter:function(a){if(a.keyCode!==13)return;k.navigate("settings",{trigger:!0})},destroy:function(){this.unbind();this.remove();this.collection.unbind("add",this.addOne);this.collection.unbind("reset",this.addAll);this.collection.unbind("all",this.render)}});i=new b;j=new d;k=new c({collection:i,appView:j});l=new Tap(document.getElementById("app-view"));Backbone.history.start()});