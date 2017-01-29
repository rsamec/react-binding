import Provider from './MobxProvider';
import { BinderCore } from './Binder';

export default class Binder {

    static bindTo(parent, path?: string, converter?, converterParams?): any {
        return BinderCore.bindTo(Provider, parent, path, converter, converterParams);
    }
    static bindArrayTo(parent, path?: string, converter?, converterParams?): any {
        return BinderCore.bindArrayTo(Provider, parent, path, converter, converterParams);
    }
}