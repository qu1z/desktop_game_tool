/**
 * Created by orphira on 14-2-11.
 */
var dataService = {
    getConfig:function (id) {
        var config = html5StorageService.get(id.toString(), versionConfig[id.toString()]);
        html5StorageService.update("CN", versionConfig[id.toString()].CN);
        console.log(config);
        return config;
    },
    getGameList:function (type) {
        return html5StorageService.get(type, constants.listModel[type]);
    },
    setGameDetail:function (data, propertiesData) {
        var obj={};
        obj.role=data;
        obj.properties=propertiesData;
        html5StorageService.update("gameDetail", obj);
    },
    getGameDetail:function () {
        return html5StorageService.get("gameDetail");
    },
    deleteGameDetail:function () {
        html5StorageService.delete("formData");
        html5StorageService.delete("gameDetail");
    },
    getConfigCN:function () {
        return html5StorageService.get("CN");
    },
    updateSetting:function(setting){
        html5StorageService.update("setting",setting);
    },
    getSetting:function(){
        return html5StorageService.get("setting");
    }
}


var gameService = {
    getGameConfig:function () {
        var gid = getParameterFromUrl(location.href, "gameid");
        return dataService.getConfig(gid);
    },
    getHintConfig:function(){
        return this.getGameConfig().rolesConfig.tips;
    },
    roleMaker:function (config) {
        console.log("roleMaker start");
        var rolesArray = [],
            rolesNumArray = [],
            roleChooser = 0,
            count = 1,
            flag = 1,
            dataArr=[],
            dataObj={},
            returnData={},
            playerNum = 0;

        for (var i = 0,ii=config.roles.length; i <ii ; i++) {
            rolesArray.push(config.roles[i].name);
            rolesNumArray.push(config.roles[i].num);
            playerNum = playerNum + parseInt(config.roles[i].num);
        }
        while (flag) {
            roleChooser = Math.floor(Math.random() * rolesArray.length);
            if (rolesNumArray[roleChooser] > 0) {
                dataArr.push("{'"+count+"':'"+rolesArray[roleChooser]+"'}");
                dataObj[count]=rolesArray[roleChooser];
                rolesNumArray[roleChooser]--;
                count++;
            }
            if (count == playerNum + 1) break;
        }
        returnData.arr=dataArr;
        returnData.obj=dataObj;
        return returnData;
    },
    buildGameConfigRoles:function (gameConfig, players) {
        var rolesNumArr = [];
        var rolesArr = gameConfig.rolesConfig.roleSort.split(',');
            playerNum = gameConfig.playerNumDefault;
            if (players) playerNum = players;
            if (playerNum in gameConfig.rolesConfig)
                rolesNumArr = gameConfig.rolesConfig[playerNum].split(",");
            else
                rolesNumArr = gameConfig.rolesConfig["default"].split(",");
        var rolesNum = rolesArr.length;
        var returnData = [];
        for (var i = 0,ii=rolesNum; i < ii ; i++) {
            returnData.push(JsonUtil.toJSON("{'name':'" + rolesArr[i] + "','num':'" + rolesNumArr[i] + "'}"));
        }
        console.log(returnData);
        console.log("buildGameConfigRoles");
        return returnData;
    },
    buildGameConfigPeopleNumList:function (data) {
        var returnData = [];
        for (var i = data[0],ii=data[1]; i <ii ; i++) {
            returnData.push(i);
        }
        return returnData;
    },
    buildRoleMakeData:function (formData, playerNum) {
        var rolesArray = [];
        for (var i = 0,ii=formData.length; i <ii ; i++) {
            if (domUtil.hasClass(formData[i], "roleItem") && !domUtil.hasClass(formData[i],"ng-hide") && formData[i].style.display != 'none') {
                var itemStr = "{'name':'" + formData[i].name + "','num':'" + formData[i].value + "'}";
                if (!JsonUtil.inArray(rolesArray, itemStr))
                    rolesArray.push(itemStr);
            }
        }
        return JsonUtil.toJSON("{'playerNum':" + playerNum + ",'roles':[" + rolesArray + "]}");
    },

    gameConfigMaker:function (config,type) {
        var gameConfig = config;
        switch (type){
            case 'init':
                gameConfig.peopleNumList = this.buildGameConfigPeopleNumList(config.peopleNum);
                gameConfig.gcRoles = this.buildGameConfigRoles(config);
                break;
            default :
                gameConfig.gameDetail=dataService.getGameDetail();
                gameConfig.roleAssign=gameConfig.gameDetail.role.obj;
                gameConfig.playerNum = config.gameDetail.role.arr.length;
                gameConfig.roles=config.gameDetail.properties;
                gameConfig.rolesName=config.rolesConfig.roleSort.split(',');
        }


        return gameConfig;
    },
    buildProperties:function ( formData,config) {
        var temp = {};
        console.log("build properties list start");
        var roles=config.rolesConfig.roleSort.split(",");
        var sp=config.showProperties;
        for(var i= 0,ii=roles.length;i<ii;i++){
            var itemObj={};
            for(var j= 0,jj=sp.length;j<jj;j++){
                switch (sp[j]){
                    case 'role':
                                itemObj.num=document.getElementsByName(roles[i])[0].value;
                                break;
                    default :
                        console.log(document.getElementsByName(roles[i]+"<-->"+sp[j])[0]);
                        itemObj[sp[j]]=document.getElementsByName(roles[i]+"<-->"+sp[j])[0].value;
                }
            }
            temp[roles[i]]=itemObj;
        }
        return temp;

    }
}